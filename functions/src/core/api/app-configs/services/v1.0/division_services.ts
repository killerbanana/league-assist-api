import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { Collections } from "src/core/enums/firebase_collections";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "src/core/exceptions/http_error";

export interface Division {
  id: string;
  name: string;
  tournament_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

class DivisionService {
  static async create(data: { name: string; tournament_id: string }): Promise<string> {
    const { name, tournament_id } = data;

    if (!name || !tournament_id) {
      throw new BadRequestError("Name and tournament_id are required.");
    }

    try {
      const db = admin.firestore();

      // Verify tournament exists
      const tournamentDoc = await db.collection(Collections.TOURNAMENT).doc(tournament_id).get();
      if (!tournamentDoc.exists) {
        throw new NotFoundError(`Tournament with ID ${tournament_id} not found.`);
      }

      const docRef = await db.collection(Collections.DIVISIONS).add({
        name,
        tournament_id,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      return docRef.id;
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error creating division:", error);
      throw new InternalServerError("Failed to create division.");
    }
  }

  static async getAll(tournamentId: string): Promise<Division[]> {
    if (!tournamentId) {
      throw new BadRequestError("Tournament ID is required.");
    }

    try {
      const db = admin.firestore();
      const snapshot = await db
        .collection(Collections.DIVISIONS)
        .where("tournament_id", "==", tournamentId)
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Division));
    } catch (error: any) {
      console.error("Error fetching divisions:", error);
      throw new InternalServerError("Failed to fetch divisions.");
    }
  }

  static async update(id: string, data: { name?: string }): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(Collections.DIVISIONS).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new NotFoundError(`Division with ID ${id} not found.`);
      }

      await docRef.update({
        ...data,
        updated_at: Timestamp.now(),
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error updating division:", error);
      throw new InternalServerError("Failed to update division.");
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(Collections.DIVISIONS).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new NotFoundError(`Division with ID ${id} not found.`);
      }

      await docRef.delete();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error deleting division:", error);
      throw new InternalServerError("Failed to delete division.");
    }
  }
}

export default DivisionService;