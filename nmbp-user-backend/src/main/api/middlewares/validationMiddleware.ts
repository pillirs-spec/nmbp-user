import { Request, Response, NextFunction } from "express";
import { STATUS, logger } from "ts-commons";
import Joi from "joi";
import { errorCodes } from "../../config";

/**
 * Validation Middleware using Joi schemas
 * Validates request body against defined schemas
 */
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const logPrefix = `validateRequest`;

    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        messages: {
          "string.base": "{#label} must be a text",
          "number.base": "{#label} must be a number",
          "any.required": "{#label} is required",
        },
      });

      if (error) {
        logger.warn(`${logPrefix} :: Validation error :: ${error.message}`);
        const errorDetails = error.details.map((detail) => ({
          field: detail.context?.label,
          message: detail.message,
        }));

        return res.status(STATUS.BAD_REQUEST).json({
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          errors: errorDetails,
        });
      }

      // Replace request body with validated and sanitized data
      req.body = value;
      next();
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message}`);
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json(errorCodes.user.USER00000);
    }
  };
};
