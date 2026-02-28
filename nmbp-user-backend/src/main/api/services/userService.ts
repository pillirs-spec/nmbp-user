import { STATUS, logger, redis } from "ts-commons";
import { redisKeysFormatter } from "../../helpers";
import { RedisKeys, CacheTTL } from "../../enums";
import { userRepository } from "../repositories";
import { smsService } from "./smsService";

interface RegistrationData {
  full_name: string;
  age: number;
  gender: string;
  pincode: string;
  district: number;
  state: number;
  email: string;
  mobile_number: string;
}

interface OTPData {
  otp: number;
  timestamp: number;
  attempts: number;
  resendCount: number;
}

export const userService = {
  /**
   * OTP LOGIC 1: STORE OTP AND REGISTRATION DATA
   * ==============================================
   * When user requests OTP for registration:
   * - Generate 6-digit OTP
   * - Store OTP with metadata (timestamp, attempts=0, resendCount=0) in Redis with 3-minute TTL
   * - Store registration data in Redis with 3-minute TTL
   * - Both keys use same txnId for correlation
   * - Send OTP via SMS (commented for development)
   *
   * Industry Standards:
   * - OTP expires in 3 minutes (CacheTTL.OTP_EXPIRY)
   * - Maximum 3 verification attempts allowed
   * - Maximum 3 resend attempts allowed
   * - Both keys automatically deleted after TTL expiry
   */
  storeOTPAndData: async (
    txnId: string,
    otp: number,
    registrationData: RegistrationData,
  ): Promise<void> => {
    const logPrefix = `userService :: storeOTPAndData`;
    try {
      logger.info(`${logPrefix} :: txnId :: ${txnId}`);

      const otpKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_OTP_BY_TXNID,
        { txnId },
      );
      const dataKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_DATA_BY_TXNID,
        { txnId },
      );

      const otpData: OTPData = {
        otp,
        timestamp: Date.now(),
        attempts: 0,
        resendCount: 0,
      };

      // Store with 3-minute TTL as per industry standard
      await redis.SetRedis(otpKey, otpData, CacheTTL.OTP_EXPIRY);
      await redis.SetRedis(dataKey, registrationData, CacheTTL.OTP_EXPIRY);

      logger.debug(
        `${logPrefix} :: OTP and registration data stored in Redis with ${CacheTTL.OTP_EXPIRY} seconds TTL`,
      );

      // Send OTP via SMS (commented for development)
      await smsService.sendOTP(registrationData.mobile_number, otp);
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },

  /**
   * OTP LOGIC 2: RESEND OTP
   * ========================
   * When user requests to resend OTP:
   * - Check if txnId exists and registration data is available
   * - Check resend limit (max 3 resends as per industry standard)
   * - Delete old OTP key from Redis
   * - Generate new OTP
   * - Store new OTP with incremented resendCount
   * - Reset TTL to 3 minutes for both OTP and registration data
   * - Send new OTP via SMS
   *
   * Industry Standards:
   * - Maximum 3 resend attempts to prevent abuse
   * - Old OTP is invalidated immediately when new OTP is generated
   * - Fresh 3-minute TTL starts with each resend
   * - Registration data persists but TTL is refreshed
   */
  resendOTP: async (txnId: string): Promise<number> => {
    const logPrefix = `userService :: resendOTP`;
    try {
      logger.info(`${logPrefix} :: txnId :: ${txnId}`);

      const otpKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_OTP_BY_TXNID,
        { txnId },
      );
      const dataKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_DATA_BY_TXNID,
        { txnId },
      );

      // Get existing registration data
      const registrationData = await userService.getRegistrationData(txnId);
      if (!registrationData) {
        throw new Error("Registration session expired. Please start again.");
      }

      // Get existing OTP data to check resend count
      const oldOtpData = await userService.getOTPData(txnId);
      const currentResendCount = oldOtpData?.resendCount || 0;

      // Check resend limit (industry standard: max 3 resends)
      if (currentResendCount >= 3) {
        logger.warn(
          `${logPrefix} :: Maximum resend attempts (3) exceeded for txnId :: ${txnId}`,
        );
        throw new Error(
          "Maximum OTP resend attempts exceeded. Please start registration again.",
        );
      }

      // Delete old OTP (industry best practice: invalidate old OTP immediately)
      await redis.deleteRedis(otpKey);
      logger.info(`${logPrefix} :: Old OTP deleted for txnId :: ${txnId}`);

      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000);

      const newOtpData: OTPData = {
        otp: newOtp,
        timestamp: Date.now(),
        attempts: 0, // Reset attempts for new OTP
        resendCount: currentResendCount + 1,
      };

      // Store new OTP with fresh 3-minute TTL
      await redis.SetRedis(otpKey, newOtpData, CacheTTL.OTP_EXPIRY);
      // Refresh registration data TTL
      await redis.SetRedis(dataKey, registrationData, CacheTTL.OTP_EXPIRY);

      logger.info(
        `${logPrefix} :: New OTP generated :: txnId :: ${txnId} :: resendCount :: ${newOtpData.resendCount}`,
      );

      // Send new OTP via SMS
      await smsService.sendOTP(registrationData.mobile_number, newOtp);

      return newOtp;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },

  getOTPData: async (txnId: string): Promise<OTPData | null> => {
    const logPrefix = `userService :: getOTPData`;
    try {
      logger.info(`${logPrefix} :: txnId :: ${txnId}`);

      const otpKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_OTP_BY_TXNID,
        { txnId },
      );

      const cachedOTP = await redis.GetKeyRedis(otpKey);
      logger.debug(`${logPrefix} :: cachedOTP :: ${cachedOTP}`);

      return cachedOTP ? JSON.parse(cachedOTP) : null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },

  getRegistrationData: async (
    txnId: string,
  ): Promise<RegistrationData | null> => {
    const logPrefix = `userService :: getRegistrationData`;
    try {
      logger.info(`${logPrefix} :: txnId :: ${txnId}`);

      const dataKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_DATA_BY_TXNID,
        { txnId },
      );

      const cachedData = await redis.GetKeyRedis(dataKey);
      logger.debug(`${logPrefix} :: cachedData :: ${cachedData}`);

      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },

  /**
   * OTP LOGIC 3: VERIFY OTP AND CREATE USER
   * ========================================
   * When user submits OTP for verification:
   * - Retrieve OTP data from Redis using txnId
   * - Check if OTP exists (not expired after 3 minutes)
   * - Validate attempt limit (max 3 attempts)
   * - Compare provided OTP with stored OTP
   * - If invalid, increment attempts and update Redis
   * - If valid, proceed to user creation
   * - After successful user creation, delete both Redis keys immediately
   *
   * Industry Standards:
   * - Maximum 3 verification attempts to prevent brute force
   * - OTP auto-expires after 3 minutes via Redis TTL
   * - After successful verification, all session data is immediately deleted
   * - User is created in DB only after successful OTP verification
   * - Atomic operation: verify OTP -> create user -> cleanup session
   */
  verifyOTP: async (txnId: string, providedOTP: string): Promise<boolean> => {
    const logPrefix = `userService :: verifyOTP`;
    try {
      logger.info(`${logPrefix} :: txnId :: ${txnId}`);

      const otpData = await userService.getOTPData(txnId);

      if (!otpData) {
        logger.warn(`${logPrefix} :: OTP expired or not found`);
        return false;
      }

      // Check attempt limit (industry standard: max 3 attempts)
      if (otpData.attempts >= 3) {
        logger.warn(`${logPrefix} :: Maximum OTP attempts (3) exceeded`);
        return false;
      }

      // Verify OTP
      if (otpData.otp.toString() !== providedOTP) {
        otpData.attempts++;
        const otpKey = redisKeysFormatter.getFormattedRedisKey(
          RedisKeys.USER_REGISTRATION_OTP_BY_TXNID,
          { txnId },
        );
        // Update attempts count with remaining TTL
        await redis.SetRedis(otpKey, otpData, CacheTTL.OTP_EXPIRY);
        logger.warn(
          `${logPrefix} :: Invalid OTP provided :: attempts :: ${otpData.attempts}/3`,
        );
        return false;
      }

      logger.info(`${logPrefix} :: OTP verified successfully`);
      return true;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },

  /**
   * Create user in database after successful OTP verification
   * Industry Standards:
   * - User creation happens only after OTP verification
   * - All Redis session data is deleted immediately after user creation
   * - This ensures no orphaned session data in Redis
   * - Follows "verify first, create later" principle
   */
  createUser: async (txnId: string): Promise<number> => {
    const logPrefix = `userService :: createUser`;
    try {
      logger.info(`${logPrefix} :: txnId :: ${txnId}`);

      const registrationData = await userService.getRegistrationData(txnId);

      if (!registrationData) {
        throw new Error("Registration data not found or expired");
      }

      // Create user in database
      const userId = await userRepository.createUser(registrationData);
      logger.info(
        `${logPrefix} :: User created successfully :: userId :: ${userId}`,
      );

      // Cleanup: Delete all Redis keys immediately after successful user creation
      // Industry best practice: Clean up session data after transaction completion
      const dataKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_DATA_BY_TXNID,
        { txnId },
      );
      const otpKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.USER_REGISTRATION_OTP_BY_TXNID,
        { txnId },
      );

      const redisKey = redisKeysFormatter.getFormattedRedisKey(
        RedisKeys.PLEDGES_LIST,
        {},
      );

      await redis.deleteRedis(dataKey);
      await redis.deleteRedis(otpKey);
      await redis.deleteRedisKeyWithPattern(`${redisKey}*`); // Clean up any pledge list cache related to the user

      logger.info(
        `${logPrefix} :: Session data cleaned up for txnId :: ${txnId}`,
      );

      return userId;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },
};
