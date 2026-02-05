import { Request, Response } from 'express';
import PlayerService from '../../services/v1.0/player_services';
import { HttpStatusCode } from "src/core/enums/Http-status-code";
import { HttpError } from "src/core/exceptions/http_error";

export class PlayerController {

  // POST /players
  async create(req: Request, res: Response): Promise<void> {
    try {
      const playerId = await PlayerService.create(req.body);
      res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "Player created successfully",
        data: { id: playerId }
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error creating player', error: error.message });
    }
  }

  // GET /players
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const players = await PlayerService.getAll();
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Players fetched successfully",
        data: players
      });
    } catch (error: any) {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching players', error: error.message });
    }
  }

  // GET /players/:id
  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const player = await PlayerService.get(req.params.id);
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Player fetched successfully",
        data: player
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching player', error: error.message });
    }
  }

  // PUT /players/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      await PlayerService.update(req.params.id, req.body);
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Player updated successfully",
        data: null
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error updating player', error: error.message });
    }
  }

  // DELETE /players/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await PlayerService.delete(req.params.id);
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Player deleted successfully",
        data: null
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting player', error: error.message });
    }
  }
}

export default new PlayerController();
