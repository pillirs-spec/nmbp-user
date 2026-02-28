import express from "express";
import { userController } from "../controllers/usersController";
import {
  requestOtpLimiter,
  resendOtpLimiter,
  verifyOtpLimiter,
} from "../middlewares/rateLimiter";
import { validateRequest } from "../middlewares/validationMiddleware";
import userValidations from "../validations/userValidations";

const userRouter = express.Router();

userRouter.get("/health", userController.health);

/**
 * POST /api/user/loginOtp
 * Request OTP for user registration
 * Rate Limit: 5 requests per 15 minutes per IP/mobile
 */
userRouter.post(
  "/loginOtp",
  requestOtpLimiter,
  validateRequest(userValidations.requestRegistrationOTP),
  userController.requestRegistrationOTP,
);

/**
 * POST /api/user/resendOTP
 * Resend OTP (old OTP will be invalidated)
 * Rate Limit: 3 requests per 10 minutes per txnId
 */
userRouter.post(
  "/resendOTP",
  resendOtpLimiter,
  validateRequest(userValidations.resendRegistrationOTP),
  userController.resendRegistrationOTP,
);

/**
 * POST /api/user/verifyOTP
 * Verify OTP and create user in database
 * Rate Limit: 10 requests per 5 minutes per txnId
 */
userRouter.post(
  "/verifyOTP",
  verifyOtpLimiter,
  validateRequest(userValidations.verifyRegistrationOTP),
  userController.verifyRegistrationOTP,
);

export default userRouter;
