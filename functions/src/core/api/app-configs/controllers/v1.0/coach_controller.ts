import { Request, Response } from "express";
import { HttpStatusCode } from "src/core/enums/Http-status-code";
import CoachService from "../../services/v1.0/coach_services";
import { HttpError } from "src/core/exceptions/http_error";

class CoachController {
  static async create(req: Request, res: Response) {
    try {
      const coachId = await CoachService.create(req.body);
      return res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "Coach created successfully",
        data: { id: coachId },
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
        message: "An error occurred while creating the coach.",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { team_id } = req.query;
      const coaches = await CoachService.getAll(team_id as string);
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Coaches fetched successfully",
        data: coaches,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while fetching coaches.",
      });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const coach = await CoachService.get(id);
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Coach fetched successfully",
        data: coach,
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
        message: "An error occurred while fetching the coach.",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CoachService.update(id, req.body);
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Coach updated successfully",
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
        message: "An error occurred while updating the coach.",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CoachService.delete(id);
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Coach deleted successfully",
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
        message: "An error occurred while deleting the coach.",
      });
    }
  }
}

export default CoachController;