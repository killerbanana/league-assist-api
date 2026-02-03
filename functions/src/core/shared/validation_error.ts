import Joi from "joi";

export const validationError = (validated: Joi.ValidationResult<any>) => {
  const errors: any = {};

  let count = 0;

  if (validated.error)
    for (const e of validated.error.details) {
      const message = e.message;
      errors[count] = message;
      count += 1;
    }

  return errors;
};
