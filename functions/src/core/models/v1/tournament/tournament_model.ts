import { Timestamp } from "firebase-admin/firestore";
import { Role } from "src/core/enums/Roles";
export type TournamentType = "full_tournament" | "showcase_tournament" | "bracket_only_tournament" | "quick_tournament" | "league";

export interface Tournament {
  id?: string;
  title: string;
  location: string;
  start_date: Timestamp;
  end_date: Timestamp;
  created_at: Timestamp | null;
  sport: string;
  created_by_user_id: string;
  staff?: Record<string, Role>;
  is_published: boolean;
  tournament_type: TournamentType;
  staff_uids?: string[];
  updated_at?: Timestamp | null;
  user_id?: string;
  time_zone?: string;
  number_of_weeks?: number;
}

export const tournamentConverter = {
  toFirestore: (tournament: Omit<Tournament, "id">): FirebaseFirestore.DocumentData => {
    return {
      title: tournament.title,
      location: tournament.location,
      sport: tournament.sport,
      start_date: tournament.start_date || null,
      end_date: tournament.end_date || null,
      created_at: tournament.created_at || null,
      created_by_user_id: tournament.created_by_user_id,
      staff: tournament.staff || {},
      is_published: tournament.is_published,
      updated_at: tournament.updated_at || null,
      tournament_type: tournament.tournament_type,
      staff_uids: tournament.staff_uids,
      user_id: tournament.user_id || null,
      time_zone: tournament.time_zone || "+08:00",
      number_of_weeks: tournament.number_of_weeks || null,
    };
  },

  fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot): Tournament => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title,
      sport: data.sport,
      location: data.location,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
      created_at: data.created_at ?? null,
      created_by_user_id: data.created_by_user_id,
      staff: data.staff ?? {},
      is_published: data.is_published,
      updated_at: data.updated_at ?? null,
      tournament_type: data.tournament_type,
      staff_uids: data.staff_uids,
      time_zone: data.time_zone,
      number_of_weeks: data.number_of_weeks ?? null,
    };
  },
};
