import { Request, Response } from "express";
import { STATUS, logger } from "ts-commons";
import { errorCodes } from "../../config";
import { v4 as uuidv4 } from "uuid";
import { userRepository } from "../repositories";
import { userService } from "../services";

export const userController = {
  health: (req: Request, res: Response): Response => {
    /*
            #swagger.tags = ['Users']
            #swagger.summary = 'Health Check'
            #swagger.description = 'Verify that the User Backend service is running and responsive'
        */
    return res.status(STATUS.OK).send({
      data: null,
      message: "User Service is Up and Running!",
    });
  },

  requestRegistrationOTP: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const logPrefix = `userController :: requestRegistrationOTP`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*  
                #swagger.tags = ['Users']
                #swagger.summary = 'Request Registration OTP'
                #swagger.description = 'Generate and send a 6-digit OTP to the provided mobile number for registration. OTP is valid for 3 minutes. Returns a txnId to use in verify/resend operations.'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                    full_name: 'John Doe',
                    age: 30,
                    gender: 1,
                    pincode: '560001',
                    district: 1,
                    state: 1,
                    mobile_number: '8169104556',
                    email: 'pillirajesh@ymail.com'
                    }
                } 
            */
      const {
        mobile_number,
        full_name,
        age,
        gender,
        pincode,
        district,
        state,
        email,
      } = req.body;

      // Validate required fields
      if (!mobile_number || mobile_number.toString().length !== 10) {
        return res.status(STATUS.BAD_REQUEST).send(errorCodes.user.USER00002);
      }

      if (
        !full_name ||
        !email ||
        gender === undefined ||
        !state ||
        !district ||
        !pincode
      ) {
        return res.status(STATUS.BAD_REQUEST).send(errorCodes.user.USER00002);
      }

      // Check if user already exists
      const userExists =
        await userRepository.existsByMobileNumber(mobile_number);
      if (userExists) {
        return res.status(STATUS.BAD_REQUEST).send(errorCodes.user.USER00001);
      }

      const txnId = uuidv4();
      const otp = Math.floor(100000 + Math.random() * 900000);

      const registrationData = {
        full_name,
        age,
        gender,
        pincode,
        district,
        state,
        email,
        mobile_number,
        status: 1,
      };

      // Store OTP and registration data in Redis with 3-minute TTL
      await userService.storeOTPAndData(txnId, otp, registrationData);

      logger.info(
        `${logPrefix} :: OTP generated successfully :: txnId :: ${txnId}`,
      );

      return res.status(STATUS.OK).send({
        data: {
          txnId,
          expiresIn: 180, // 3 minutes in seconds
          message: `OTP sent to ${mobile_number}. Valid for 3 minutes.`,
        },
        message: "OTP generated successfully",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .send(errorCodes.user.USER00000);
    }
  },

  resendRegistrationOTP: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const logPrefix = `userController :: resendRegistrationOTP`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*  
                #swagger.tags = ['Users']
                #swagger.summary = 'Resend Registration OTP'
                #swagger.description = 'Resend OTP for registration. Old OTP is invalidated immediately. New OTP is valid for 3 minutes. Maximum 3 resend attempts allowed.'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                    txnId: 'uuid-string'
                    }
                } 
            */
      const { txnId } = req.body;

      if (!txnId) {
        return res.status(STATUS.BAD_REQUEST).send(errorCodes.user.USER00002);
      }

      // Resend OTP (old OTP will be deleted)
      const newOtp = await userService.resendOTP(txnId);

      logger.info(
        `${logPrefix} :: OTP resent successfully :: txnId :: ${txnId}`,
      );

      return res.status(STATUS.OK).send({
        data: {
          txnId,
          expiresIn: 180, // 3 minutes in seconds
          message: "New OTP sent successfully. Old OTP is now invalid.",
        },
        message: "OTP resent successfully",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);

      // Handle specific error messages
      if (
        error.message.includes("expired") ||
        error.message.includes("start again")
      ) {
        return res.status(STATUS.BAD_REQUEST).send({
          code: "USER00004",
          message: error.message,
        });
      }

      if (error.message.includes("Maximum")) {
        return res.status(STATUS.BAD_REQUEST).send({
          code: "USER00005",
          message: error.message,
        });
      }

      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .send(errorCodes.user.USER00000);
    }
  },

  verifyRegistrationOTP: async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const logPrefix = `userController :: verifyRegistrationOTP`;
    try {
      logger.info(`${logPrefix} :: Request received`);
      /*  
                #swagger.tags = ['Users']
                #swagger.summary = 'Verify Registration OTP'
                #swagger.description = 'Verify the OTP sent to the mobile number. After successful verification, user will be created in the database and all session data will be deleted from Redis.'
                #swagger.parameters['body'] = {
                    in: 'body',
                    required: true,
                    schema: {
                    txnId: 'uuid-string',
                    otp: '123456'
                    }
                } 
            */
      const { txnId, otp } = req.body;

      if (!txnId || !otp) {
        return res.status(STATUS.BAD_REQUEST).send(errorCodes.user.USER00002);
      }

      // Verify OTP
      const isOTPValid = await userService.verifyOTP(txnId, otp);

      if (!isOTPValid) {
        return res.status(STATUS.BAD_REQUEST).send({
          code: "USER00003",
          message:
            "Invalid or expired OTP. Please check the OTP or request a new one.",
        });
      }

      // Create user ONLY after successful OTP verification
      const pledgeId = await userService.createUser(txnId);

      logger.info(
        `${logPrefix} :: User created successfully :: pledgeId :: ${pledgeId}`,
      );

      return res.status(STATUS.CREATED).send({
        data: {
          pledgeId,
          message: "User registered successfully",
        },
        message: "OTP verified and user created",
      });
    } catch (error) {
      logger.error(`${logPrefix} :: Error :: ${error.message} :: ${error}`);
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .send(errorCodes.user.USER00000);
    }
  },
};
