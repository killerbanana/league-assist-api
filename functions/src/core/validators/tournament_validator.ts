import Joi from "joi";
import { Role } from "src/core/enums/Roles"; // Assuming this path is correct

/**
 * Valid list of all possible tournament types.
 */
const tournamentTypes: string[] = [
  "full_tournament",
  "showcase_tournament",
  "bracket_only_tournament",
  "quick_tournament",
];

/**
 * Valid list of all possible staff roles.
 */
const staffRoles: string[] = Object.values(Role);

/**
 * 👩‍💻 Validator for **CREATING** a new tournament.
 */
export const createTournamentBodySchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  location: Joi.string().min(3).max(100).required(),
  sport: Joi.string().required(),
  tournament_type: Joi.string()
    .valid(...tournamentTypes)
    .required(),

  // Dates must be in ISO format (e.g., "2025-10-01T09:00:00.000Z")
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref("start_date")).required().messages({
    "date.greater": "end_date must be after start_date.",
  }),
});

/**
 * 🛠️ Validator for **UPDATING** an existing tournament.
 * This strictly follows your `TournamentUpdateData` type,
 * only allowing these four fields.
 */
export const updateTournamentBodySchema = Joi.object({
  title: Joi.string().min(3).max(100),
  location: Joi.string().min(3).max(100),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
})
  .min(1) // Must provide at least one field to update
  .messages({ "object.min": "Request body must contain at least one valid field to update." })
  .when(Joi.object({ start_date: Joi.exist(), end_date: Joi.exist() }).unknown(), {
    then: Joi.object({
      end_date: Joi.date().iso().greater(Joi.ref("start_date")).messages({
        "date.greater": "end_date must be after start_date.",
      }),
    }),
  });

/**
 * 🧑‍🤝‍🧑 Validator for **ADDING STAFF** to a tournament.
 */
export const addStaffBodySchema = Joi.object({
  staff_member_uid: Joi.string().required(),
  role: Joi.string()
    .valid(...staffRoles)
    .required(),
});
