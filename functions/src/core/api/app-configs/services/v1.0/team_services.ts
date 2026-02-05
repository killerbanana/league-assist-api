import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "src/core/exceptions/http_error";
import { Team, teamConverter } from "src/core/models/v1/teams/team_model";
import { Collections } from "src/core/enums/firebase_collections";

const TEAMS_COLLECTION = "teams";

class TeamService {
  static async create(data: Partial<Team>): Promise<string> {
    const { name, tournament_id, division_id } = data;

    if (!name || !tournament_id) {
      throw new BadRequestError("Team name and tournament_id are required.");
    }

    try {
      const db = admin.firestore();

      // Verify tournament exists
      const tournamentDoc = await db.collection(Collections.TOURNAMENT).doc(tournament_id).get();
      if (!tournamentDoc.exists) {
        throw new NotFoundError(`Tournament with ID ${tournament_id} not found.`);
      }

      // Verify division exists if provided
      if (division_id) {
        const divisionDoc = await db.collection(Collections.DIVISIONS).doc(division_id).get();
        if (!divisionDoc.exists) {
          throw new NotFoundError(`Division with ID ${division_id} not found.`);
        }
      }

      const teamData = {
        ...data,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };

      // Remove undefined fields
      Object.keys(teamData).forEach(key => teamData[key as keyof typeof teamData] === undefined && delete teamData[key as keyof typeof teamData]);

      const docRef = await db.collection(TEAMS_COLLECTION)
        .withConverter(teamConverter)
        .add(teamData as Team);

      return docRef.id;
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error creating team:", error);
      throw new InternalServerError("Failed to create team.");
    }
  }

  static async get(id: string): Promise<Team> {
    try {
      const db = admin.firestore();
      const doc = await db.collection(TEAMS_COLLECTION).doc(id).withConverter(teamConverter).get();

      if (!doc.exists) {
        throw new NotFoundError(`Team with ID ${id} not found.`);
      }

      return doc.data()!;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error fetching team:", error);
      throw new InternalServerError("Failed to fetch team.");
    }
  }

  static async getAll(filters: { tournament_id?: string; division_id?: string }): Promise<Team[]> {
    try {
      const db = admin.firestore();
      let query: admin.firestore.Query<Team> = db.collection(TEAMS_COLLECTION).withConverter(teamConverter);

      if (filters.tournament_id) {
        query = query.where("tournament_id", "==", filters.tournament_id);
      }

      if (filters.division_id) {
        query = query.where("division_id", "==", filters.division_id);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => doc.data());
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      throw new InternalServerError("Failed to fetch teams.");
    }
  }

  static async update(id: string, data: Partial<Team>): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(TEAMS_COLLECTION).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new NotFoundError(`Team with ID ${id} not found.`);
      }

      await docRef.update({
        ...data,
        updated_at: Timestamp.now(),
      });
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error updating team:", error);
      throw new InternalServerError("Failed to update team.");
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const db = admin.firestore();
      const docRef = db.collection(TEAMS_COLLECTION).doc(id);

      const doc = await docRef.get();
      if (!doc.exists) {
        throw new NotFoundError(`Team with ID ${id} not found.`);
      }

      await docRef.delete();
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      console.error("Error deleting team:", error);
      throw new InternalServerError("Failed to delete team.");
    }
  }
}

export default TeamService;