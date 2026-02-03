import Joi from "joi";

export const updateGameBodySchema = Joi.object({
  time_zone: Joi.string().default("+08:00"),
  time_slot: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .messages({
      "string.pattern.base": "time_slot must be in HH:MM format.",
    }),
  half: Joi.number().allow(null),
  quarter: Joi.number().allow(null),
  court_id: Joi.string(),
  court: Joi.string(),
  is_final: Joi.boolean(),
  duration: Joi.number().allow(null),
  in_progress: Joi.boolean(),
  timer_running: Joi.boolean(),
  team_1_score: Joi.string(),
  team_2_score: Joi.string(),
  location: Joi.string(),
  location_id: Joi.string(),
  game_time: Joi.string(),
  last_run: Joi.date().allow(null),
  start_time: Joi.date().allow(null),
  game_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base": "game_date must be in YYYY-MM-DD format.",
    }),
  team_1_id: Joi.string().allow(null),
  team_2_id: Joi.string().allow(null),
})
  .min(1)
  .messages({
    "object.min": "Request body must contain at least one valid field to update.",
  });
