import * as admin from "firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { Role } from "src/core/enums/Roles";
import {
  ConflictError,
  ForbiddenError,
  HttpError,
  InternalServerError,
  NotFoundError,
} from "src/core/exceptions/http_error";
import { Collections } from "src/core/enums/firebase_collections";
import { Tournament, tournamentConverter, TournamentType } from "src/core/models/v1/tournament/tournament_model";


type TournamentListItem = Omit<Tournament, "staff" | "staff_uids" | "created_by_user_id"> & { team_count: number };

interface TournamentsResponse {
  status: number;
  message: string;
  data: TournamentListItem[];
}

class TournamentService {
  static async all(
    sport: string,
    tournamentLocation?: string,
    startDate?: string,
    endDate?: string,
    user?: { uid: string; isAdmin?: boolean }
  ): Promise<TournamentsResponse> {
    try {
      const db = admin.firestore();

      // Inner function to fetch standard, full tournaments
      const fetchRegularTournaments = async (): Promise<TournamentListItem[]> => {
        let baseQuery: admin.firestore.Query<Tournament> = db
          .collection(Collections.TOURNAMENT)
          .where("sport", "==", sport)
          .withConverter(tournamentConverter);

        if (tournamentLocation) {
          baseQuery = baseQuery.where("location", "==", tournamentLocation);
        }
        if (endDate && startDate) {
          const startOfDay = new Date(startDate);
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          baseQuery = baseQuery.where("start_date", ">=", startOfDay).where("end_date", "<=", endOfDay);
        }

        let finalQuery = baseQuery;
        if (user) {
          if (!user.isAdmin) {
            finalQuery = baseQuery.where("staff_uids", "array-contains", user.uid);
          }
        } else {
          finalQuery = baseQuery.where("is_published", "==", true);
        }

        const tournamentSnapshot = await finalQuery.get();
        if (tournamentSnapshot.empty) return [];

        return Promise.all(
          tournamentSnapshot.docs.map(async (doc) => {
            const tournamentData = doc.data();
            const tournamentId = doc.id;
            const teamsCountQuery = db.collection("teams").where("tournament_id", "==", tournamentId);
            const teamsSnapshot = await teamsCountQuery.count().get();
            const team_count = teamsSnapshot.data().count;
            const { staff, staff_uids, created_by_user_id, ...filteredData } = tournamentData;
            return { ...filteredData, team_count };
          })
        );
      };

      // Run both fetch operations in parallel for efficiency
      const [regularTournaments,] = await Promise.all([
        fetchRegularTournaments(),
      ]);

      const combinedData = [...regularTournaments,];

      // Return the final, structured response
      return {
        status: 200,
        message: "Tournaments fetched successfully",
        data: combinedData,
      };
    } catch (error: any) {
      console.error("[FETCH_TOURNAMENTS] Error fetching tournaments:", error);
      throw new InternalServerError("Failed to fetch tournaments.");
    }
  }

  // ... rest of the service file remains unchanged
  static async locations(sport: string): Promise<string[]> {
    try {
      const db = admin.firestore();
      let query = db.collection(Collections.TOURNAMENT).where("sport", "==", sport).withConverter(tournamentConverter);

      query = query.orderBy("title", "asc");

      const snapshot = await query.get();

      if (snapshot.empty) {
        console.log(`[FETCH_TOURNAMENT_LOCATIONS] No locations found for sport: ${sport}.`);
        return [];
      }

      const locations: string[] = snapshot.docs.map((doc) => doc.get("location"));

      console.log(
        `[FETCH_TOURNAMENT_LOCATIONS] Successfully fetched ${locations.length} locations for sport: ${sport}.`
      );

      return locations;
    } catch (error: any) {
      console.error("[FETCH_TOURNAMENT_LOCATIONS] Error fetching tournament locations:", error);
      throw new InternalServerError("Failed to fetch tournament locations.");
    }
  }

  static async createTournament(
    data: {
      title: string;
      location: string;
      start_date: Timestamp;
      end_date: Timestamp;
      sport: string;
      tournament_type: TournamentType;
    },
    user: { uid: string }
  ): Promise<string> {
    try {
      const db = admin.firestore();

      const newTournamentData: Omit<Tournament, "id"> = {
        ...data,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        created_by_user_id: user.uid,
        is_published: true,
        staff: {
          [user.uid]: Role.TournamentDirector,
        },
        staff_uids: [user.uid],
        user_id: user.uid,
      };

      const docRef = await db
        .collection(Collections.TOURNAMENT)
        .withConverter(tournamentConverter)
        .add(newTournamentData);

      return docRef.id;
    } catch (error: any) {
      throw new InternalServerError("Failed to create tournament.");
    }
  }

  static async addStaff(
    tournamentId: string,
    staffMemberUid: string,
    role: Role,
    currentUser: { uid: string; roles?: string[] }
  ): Promise<void> {
    try {
      await admin.auth().getUser(staffMemberUid);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new NotFoundError("The user ID provided for the new staff member does not exist.");
      }

      console.error(`Error verifying user UID ${staffMemberUid}:`, error);
      throw new InternalServerError("An error occurred while verifying the user.");
    }

    const db = admin.firestore();
    const tournamentRef = db.collection(Collections.TOURNAMENT).doc(tournamentId);

    try {
      await db.runTransaction(async (transaction) => {
        const tournamentDoc = await transaction.get(tournamentRef);
        if (!tournamentDoc.exists) {
          throw new NotFoundError("Tournament not found.");
        }

        const tournamentData = tournamentDoc.data() as Tournament;

        if (tournamentData.staff?.[staffMemberUid]) {
          throw new ConflictError("This user is already a staff member.");
        }

        const isGlobalAdmin = currentUser.roles?.includes(Role.Admin);
        const isTournamentDirector = tournamentData.staff?.[currentUser.uid] === Role.TournamentDirector;

        if (!isGlobalAdmin && !isTournamentDirector) {
          throw new ForbiddenError("Only an admin or a director of this tournament can add staff.");
        }

        transaction.update(tournamentRef, {
          [`staff.${staffMemberUid}`]: role,
          staff_uids: FieldValue.arrayUnion(staffMemberUid),
          updated_at: Timestamp.now(),
        });
      });

      console.log(`User ${staffMemberUid} added to tournament ${tournamentId} with role ${role}.`);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      console.error(`Unexpected error in addStaff service for tournament ${tournamentId}:`, error);
      throw new Error("An internal service error occurred.");
    }
  }
}

export default TournamentService;
