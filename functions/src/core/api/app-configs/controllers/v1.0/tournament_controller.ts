import { Request, Response } from "express";
import { HttpStatusCode } from "src/core/enums/Http-status-code";
import TournamentService from "../../services/v1.0/tournament_services";
import { Timestamp } from "firebase-admin/firestore";

const parseToTimestamp = (input: string | Date): Timestamp => {
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid or unrecognized date format for: ${input}.`);
  }
  return Timestamp.fromDate(date);
};

class TournamentController {
  static async all(req: Request, res: Response) {
    try {
      const { sport, location, startDate, endDate } = req.query;

      const userForService = req.currentUser ?? undefined;

      // highlight-start
      // The service now returns an object, not just an array.
      const serviceResponse = await TournamentService.all(
        sport as string,
        location as string | undefined,
        startDate as string | undefined,
        endDate as string | undefined,
        userForService
      );

      // Check the length of the data array within the response object.
      if (serviceResponse.data.length === 0) {
        return res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "No tournaments found matching your criteria.",
          data: [],
        });
      }

      // Return the response object directly from the service.
      return res.status(serviceResponse.status).json(serviceResponse);
      // highlight-end
    } catch (error: any) {
      console.error("[TOURNAMENT_CONTROLLER_ERROR]", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while fetching tournaments.",
        data: null,
      });
    }
  }

  static async locations(req: Request, res: Response) {
    try {
      const sportName = req.query.sport as string;

      if (!sportName) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: HttpStatusCode.BAD_REQUEST,
          message: "sport query parameters is required.",
          data: null,
        });
      }

      const locations = await TournamentService.locations(sportName);

      if (!locations) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          status: HttpStatusCode.NOT_FOUND,
          message: "No location found for this game",
          data: null,
        });
      }

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Tournament locations fetched successfully",
        data: locations,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while processing the request.",
        data: null,
      });
    }
  }

  static async createTournament(req: Request, res: Response) {
    try {
      const user = req.currentUser;
      if (!user) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          status: HttpStatusCode.UNAUTHORIZED,
          message: "Authentication required to create a tournament.",
        });
      }

      const { title, location, start_date, end_date, sport, tournament_type } = req.body;

      if (!title || !location || !start_date || !end_date || !sport) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: HttpStatusCode.BAD_REQUEST,
          message: "Missing required fields: title, location, start_date, end_date, sport.",
        });
      }

      // The service now expects the full user object, not just the user_id.
      const tournamentId = await TournamentService.createTournament(
        {
          title,
          location,
          start_date: parseToTimestamp(start_date),
          end_date: parseToTimestamp(end_date),
          sport,
          tournament_type,
        },
        user
      );

      return res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "Tournament created successfully.",
        data: { id: tournamentId },
      });
    } catch (error: any) {
      console.error("[CREATE_TOURNAMENT_CONTROLLER] Error:", error.message);

      // Handle specific known errors, like invalid date format.
      if (error.message.includes("Invalid date format")) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: HttpStatusCode.BAD_REQUEST,
          message: error.message,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An unexpected error occurred while creating the tournament.",
      });
    }
  }
}

export default TournamentController;
