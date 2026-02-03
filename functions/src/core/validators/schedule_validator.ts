import Joi from "joi";

const newGameSchema = Joi.object({
  game_number: Joi.string().required(),
  tournament_id: Joi.string().required(),
  location_id: Joi.string().required(),
  team_1_id: Joi.string().when("game_type", {
    is: "bracket",
    then: Joi.optional().allow(null, ""),
    otherwise: Joi.required(),
  }),
  team_2_id: Joi.string().when("game_type", {
    is: "bracket",
    then: Joi.optional().allow(null, "").not(Joi.ref("team_1_id")),
    otherwise: Joi.required().not(Joi.ref("team_1_id")),
  }).messages({
    "any.invalid": "A team cannot play against itself (team_2_id must not be the same as team_1_id).",
  }),
  game_type: Joi.string().valid("pool", "bracket", "championship", "exhibition").required(),
  game_time: Joi.string().required(),
  scheduled: Joi.boolean().required(),
  scheduled_id: Joi.string().required(),
  division_id: Joi.string().allow(null, ""),
  pool_id: Joi.string().allow(null, ""),
  pool: Joi.string().allow(null, ""),
  game_draft: Joi.string().allow(null, ""),
  court_id: Joi.string().when("scheduled", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
  game_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .when("scheduled", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.pattern.base": "game_date must be in YYYY-MM-DD format.",
    }),
  time_slot: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .when("scheduled", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.pattern.base": "time_slot must be in HH:MM format.",
    }),
});

export const createGamesBulkSchema = Joi.object({
  games: Joi.array().items(newGameSchema).min(1).required().messages({
    "array.min": "At least one game must be provided in the games array.",
    "any.required": "The games array is a required field.",
  }),
  timezone: Joi.string().optional(),
});
