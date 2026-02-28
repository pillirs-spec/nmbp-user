import Joi from "joi";
import { errorCodes } from "../../config";
import { IUser } from "../../types/custom";

/**
 * User Registration OTP Request Validation
 * Ensures all input data is valid before processing
 */
const userValidations = {
  requestRegistrationOTP: Joi.object({
    mobile_number: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Mobile number must be a valid 10-digit Indian number",
        "any.required": "Mobile number is required",
      }),

    full_name: Joi.string().min(2).max(100).trim().required().messages({
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),

    email: Joi.string()
      .email()
      .max(100)
      .trim()
      .lowercase()
      .required()
      .messages({
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      }),

    age: Joi.number().integer().min(13).max(120).required().messages({
      "number.min": "Age must be at least 13 years",
      "number.max": "Age cannot exceed 120 years",
      "any.required": "Age is required",
    }),

    gender: Joi.number().integer().min(0).max(2).required().messages({
      "number.min": "Invalid gender value",
      "number.max": "Invalid gender value",
      "any.required": "Gender is required",
    }),

    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "Pincode must be a valid 6-digit number",
        "any.required": "Pincode is required",
      }),

    state: Joi.number().integer().positive().required().messages({
      "number.positive": "State must be a valid ID",
      "any.required": "State is required",
    }),

    district: Joi.number().integer().positive().required().messages({
      "number.positive": "District must be a valid ID",
      "any.required": "District is required",
    }),
  }).strict(),

  /**
   * Resend OTP Validation
   */
  resendRegistrationOTP: Joi.object({
    txnId: Joi.string().uuid({ version: "uuidv4" }).required().messages({
      "string.guid": "txnId must be a valid UUID v4",
      "any.required": "txnId is required",
    }),
  }).strict(),

  /**
   * Verify OTP Validation
   */
  verifyRegistrationOTP: Joi.object({
    txnId: Joi.string().uuid({ version: "uuidv4" }).required().messages({
      "string.guid": "txnId must be a valid UUID v4",
      "any.required": "txnId is required",
    }),

    otp: Joi.string()
      .length(6)
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.length": "OTP must be exactly 6 digits",
        "string.pattern.base": "OTP must contain only digits",
        "any.required": "OTP is required",
      }),
  }).strict(),
};

export default userValidations;
