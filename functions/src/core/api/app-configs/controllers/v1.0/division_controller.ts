import { Request, Response } from "express";
import { HttpStatusCode } from "src/core/enums/Http-status-code";
import DivisionService from "../../services/v1.0/division_services";
import { HttpError } from "src/core/exceptions/http_error";

class DivisionController {
  static async create(req: Request, res: Response) {
    try {
      const { name, tournament_id } = req.body;
      const id = await DivisionService.create({ name, tournament_id });

      return res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "Division created successfully",
        data: { id },
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
        message: "An error occurred while creating the division.",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { tournament_id } = req.query;
      const divisions = await DivisionService.getAll(tournament_id as string);

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Divisions fetched successfully",
        data: divisions,
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
        message: "An error occurred while fetching divisions.",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      await DivisionService.update(id, { name });

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Division updated successfully",
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
        message: "An error occurred while updating the division.",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DivisionService.delete(id);

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Division deleted successfully",
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
        message: "An error occurred while deleting the division.",
      });
    }
  }
}

export default DivisionController;