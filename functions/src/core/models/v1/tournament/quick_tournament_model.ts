import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export type TournamentType = "quick_tournament";

export interface ContactInfo {
  email: string;
  name: string;
  phone: string;
  postOnApp: boolean;
}

// ✨ FIX: The start_date is now allowed to be null.
// This makes the type definition match the resilient logic in the converter.
export interface SchedulePreview {
  sport: string;
  start_date: Timestamp | null;
  status: string;
}

export interface QuickTournamentModel {
  id: string;
  contact_info: ContactInfo;
  schedule_preview: SchedulePreview;
  created_at: Timestamp;
  created_by_user_id: string;
  start_date: Timestamp;
  end_date: Timestamp;
  gym_location: string;
  location: string;
  logo_url: string | null;
  status: string;
  title: string;
  sport: string;
  tournament_type: TournamentType;
}

const quickTournamentConverter = {
  toFirestore: (tournament: QuickTournamentModel): admin.firestore.DocumentData => {
    // No changes were needed here.
    return {
      contact_info: tournament.contact_info,
      schedule_preview: tournament.schedule_preview,
      created_at: tournament.created_at,
      created_by_user_id: tournament.created_by_user_id,
      end_date: tournament.end_date,
      start_date: tournament.start_date,
      gym_location: tournament.gym_location,
      location: tournament.location,
      logo_url: tournament.logo_url,
      status: tournament.status,
      title: tournament.title,
      sport: tournament.sport,
      tournament_type: tournament.tournament_type,
    };
  },

  // ✨ FIX: The fromFirestore method is now resilient to missing data.
  // It will no longer crash if schedule_preview or its nested fields are missing.
  fromFirestore: (snapshot: admin.firestore.QueryDocumentSnapshot): QuickTournamentModel => {
    const data = snapshot.data();

    // Safely handle a possibly incomplete or missing schedule_preview object.
    const schedulePreviewData = data.schedule_preview || {};

    return {
      id: snapshot.id,
      contact_info: data.contact_info,
      // Create the object safely with default values for any missing fields.
      schedule_preview: {
        sport: schedulePreviewData.sport || "",
        start_date: schedulePreviewData.start_date || null,
        status: schedulePreviewData.status || "TBD",
      },
      created_at: data.created_at,
      created_by_user_id: data.created_by_user_id,
      start_date: data.start_date,
      end_date: data.end_date,
      gym_location: data.gym_location,
      location: data.location,
      logo_url: data.logo_url || null,
      status: data.status,
      title: data.title,
      tournament_type: data.tournament_type,
      sport: data.sport,
    };
  },
};

export { quickTournamentConverter };
