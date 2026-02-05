import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "src/core/exceptions/http_error";
import { Coach, coachConverter } from "src/core/models/v1/coach/coach_model";

const COACHES_COLLECTION = "coaches";
const TEAMS_COLLECTION = "teams";

class CoachService {
  static async create(data: Partial<Coach>): Promise<string> {
    const { name, email, team_id } = data;

    if (!name || !email) {
      throw new BadRequestError("Name and email are required.");
    }

    try {
      const db = admin.firestore();

      // Verify team exists if team_id is provided
      if (team_id) {
        const teamDoc = await db.collection(TEAMS_COLLECTION).doc(team_id).get();
        if (!teamDoc.exists) {
          throw new NotFoundError(`Team with ID ${team_id} not found.`);
        }
      }

      const coachData = {
        ...data,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };

      const docRef = await db.collection(COACHES_COLLECTION)
        .withConverter(coachConverter)
        .add(coachData as Coach);

      return docRef.id;
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
      console.error("Error creating coach:", error);
      throw new InternalServerError("Failed to create coach.");
    }
  }

  static async getAll(team_id?: string): Promise<Coach[]> {
    try {
      const db = admin.firestore();
      let query: admin.firestore.Query = db.collection(COACHES_COLLECTION).withConverter(coachConverter);

      if (team_id) {
        query = query.where("team_id", "==", team_id);
      }

      const snapshot = await query.get();

      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => doc.data() as Coach);
    } catch (error: any) {
      console.error("Error fetching coaches:", error);
      throw new InternalServerError("Failed to fetch coaches.");
    }
  }

  static async get(id: string): Promise<Coach> {
    try {
      const db = admin.firestore();
      const doc = await db.collection(COACHES_COLLECTION).doc(id).withConverter(coachConverter).get();

      if (!doc.exists) {
        throw new NotFoundError(`Coach with ID ${id} not found.`);
      }

      return doc.data()!;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error fetching coach:", error);
      throw new InternalServerError("Failed to fetch coach.");
    }
  }

  static async update(id: string, data: Partial<Coach>): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(COACHES_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError(`Coach with ID ${id} not found.`);
      }

      await docRef.update({
        ...data,
        updated_at: Timestamp.now(),
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error updating coach:", error);
      throw new InternalServerError("Failed to update coach.");
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(COACHES_COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError(`Coach with ID ${id} not found.`);
      }

      await docRef.delete();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error deleting coach:", error);
      throw new InternalServerError("Failed to delete coach.");
    }
  }
}

export default CoachService;