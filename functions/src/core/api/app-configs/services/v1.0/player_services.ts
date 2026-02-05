import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "src/core/exceptions/http_error";
import { Player, playerConverter } from "src/core/models/v1/player/player_model";

const PLAYERS_COLLECTION = "players";

class PlayerService {
  static async create(data: Partial<Player>): Promise<string> {
    const { name, position, team, jerseyNumber } = data;

    if (!name || !position || !team || jerseyNumber === undefined) {
      throw new BadRequestError("Name, position, team, and jerseyNumber are required.");
    }

    try {
      const db = admin.firestore();
      const playerData = {
        ...data,
        isActive: data.isActive ?? true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };

      const docRef = await db.collection(PLAYERS_COLLECTION)
        .withConverter(playerConverter)
        .add(playerData as Player);

      return docRef.id;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      console.error("Error creating player:", error);
      throw new InternalServerError("Failed to create player.");
    }
  }

  static async getAll(): Promise<Player[]> {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection(PLAYERS_COLLECTION).withConverter(playerConverter).get();

      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => doc.data());
    } catch (error: any) {
      console.error("Error fetching players:", error);
      throw new InternalServerError("Failed to fetch players.");
    }
  }

  static async get(id: string): Promise<Player> {
    try {
      const db = admin.firestore();
      const doc = await db.collection(PLAYERS_COLLECTION).doc(id).withConverter(playerConverter).get();

      if (!doc.exists) {
        throw new NotFoundError(`Player with ID ${id} not found.`);
      }

      return doc.data()!;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error fetching player:", error);
      throw new InternalServerError("Failed to fetch player.");
    }
  }

  static async update(id: string, data: Partial<Player>): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(PLAYERS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError(`Player with ID ${id} not found.`);
      }

      await docRef.update({
        ...data,
        updated_at: Timestamp.now(),
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error updating player:", error);
      throw new InternalServerError("Failed to update player.");
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(PLAYERS_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError(`Player with ID ${id} not found.`);
      }

      await docRef.delete();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error deleting player:", error);
      throw new InternalServerError("Failed to delete player.");
    }
  }
}

export default PlayerService;
