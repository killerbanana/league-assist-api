import Joi from "joi";

// --- Reusable Schemas ---

/**
 * Validates the time_zone offset string.
 * Allows "Z" or "+/-HH:MM" (e.g., "+08:00").
 */
const timeZoneSchema = Joi.string()
  .pattern(/^(Z|([+-])(\d{2}):?(\d{2}))$/)
  .messages({ "string.pattern.base": "time_zone must be an ISO offset (e.g., +08:00 or Z)." });

/**
 * Validates a single TimeRange object.
 * Allows null values for start/end times.
 */
const timeRangeSchema = Joi.object({
  start_time: Joi.string()
    .pattern(/^\d{1,2}:\d{2}(:\d{2})?$/) // HH:MM or HH:MM:SS
    .allow(null)
    .messages({ "string.pattern.base": "start_time must be in HH:MM or HH:MM:SS format." }),
  end_time: Joi.string()
    .pattern(/^\d{1,2}:\d{2}(:\d{2})?$/) // HH:MM or HH:MM:SS
    .allow(null)
    .messages({ "string.pattern.base": "end_time must be in HH:MM or HH:MM:SS format." }),
});

/**
 * Validates the entire default_availability object.
 * Keys must be "YYYY-MM-DD".
 * Values must match the timeRangeSchema.
 * The entire object itself is allowed to be null.
 */
const availabilitySchema = Joi.object()
  .pattern(
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD key
    timeRangeSchema
  )
  .allow(null)
  .messages({ "string.pattern.base": "default_availability keys must be in YYYY-MM-DD format." });

// --- Body Schemas ---

/**
 * 👩‍💻 Validator for **CREATING** a new venue.
 * Most fields are required.
 */
export const createVenueBodySchema = Joi.object({
  // Required fields
  name: Joi.string().required(),
  tournament_id: Joi.string().required(),
  abbreviation: Joi.string().max(10).required(),
  number_of_courts: Joi.number().integer().min(0).required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),

  // Optional fields
  notes: Joi.string().allow("", null).optional(),
  default_availability: availabilitySchema.optional(),
  time_zone: timeZoneSchema.optional().default("+08:00"),
});

/**
 * 🛠️ Validator for **UPDATING** an existing venue.
 * All fields are optional, but at least one must be provided.
 */
export const updateVenueBodySchema = Joi.object({
  name: Joi.string(),
  abbreviation: Joi.string().max(10),
  number_of_courts: Joi.number().integer().min(0),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  zip: Joi.string(),
  notes: Joi.string().allow("", null),
  default_availability: availabilitySchema,
  time_zone: timeZoneSchema,
  // tournament_id is typically not updatable
})
  .min(1)
  .messages({
    "object.min": "Request body must contain at least one valid field to update.",
  });
