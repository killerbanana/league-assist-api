import { Request, Response } from "express";
import { HttpStatusCode } from "src/core/enums/Http-status-code";
import TeamService from "../../services/v1.0/team_services";
import { HttpError } from "src/core/exceptions/http_error";

class TeamController {
  static async create(req: Request, res: Response) {
    try {
      const teamId = await TeamService.create(req.body);

      return res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "Team created successfully",
        data: { id: teamId },
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          status: error.statusCode,
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while creating the team.",
      });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const team = await TeamService.get(id);

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Team fetched successfully",
        data: team,
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          status: error.statusCode,
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while fetching the team.",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { tournament_id, division_id } = req.query;
      const teams = await TeamService.getAll({
        tournament_id: tournament_id as string,
        division_id: division_id as string,
      });

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Teams fetched successfully",
        data: teams,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while fetching teams.",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await TeamService.update(id, req.body);

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Team updated successfully",
        data: null,
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          status: error.statusCode,
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while updating the team.",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await TeamService.delete(id);

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Team deleted successfully",
        data: null,
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          status: error.statusCode,
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while deleting the team.",
      });
    }
  }
}

export default TeamController;