// src/middlewares/Validation.ts
import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

/**
 * A middleware factory that takes a Joi schema and returns an Express middleware
 * for validating the request body.
 */
export const validateBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Use the schema to validate the request body
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Report all validation errors, not just the first
      stripUnknown: true, // Securely remove any properties not in the schema
    });

    // 2. If validation fails, send a detailed 400 error response
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 400,
        message: "Validation Error",
        errors: errorMessages,
      });
    }

    // 3. IMPORTANT: Overwrite req.body with the sanitized value for the controller
    req.body = value;

    // 4. If validation succeeds, proceed to the next middleware
    return next();
  };
};
