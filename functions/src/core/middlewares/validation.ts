// middlewares/Validation.ts

import { Request, Response, NextFunction } from "express";
import Joi from "joi";

class Validation {
  static validateBody(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      // 1. Capture the validated and sanitized 'value'
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true, // 2. Add stripUnknown for extra security 🛡️
      });

      if (error) {
        const messages = error.details.map((detail) => detail.message);
        return res.status(400).json({
          status: 400,
          message: "Validation failed",
          errors: messages, // 3. Use 'errors' key for clarity
        });
      }

      // 4. Overwrite req.body with the sanitized value for the controller to use
      req.body = value;
      return next();
    };
  }
}

export default Validation;
