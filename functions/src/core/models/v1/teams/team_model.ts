import { FirestoreDataConverter, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";

export interface Team {
  id: string;
  name: string;
  tournament_id: string;
  division_id?: string;
  coach_user_id?: string;
  coach_name?: string;
  contact_email?: string;
  logo_url?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export const teamConverter: FirestoreDataConverter<Team> = {
  toFirestore(team: Team): FirebaseFirestore.DocumentData {
    const { id, ...data } = team;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Team {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      tournament_id: data.tournament_id,
      division_id: data.division_id,
      coach_user_id: data.coach_user_id,
      coach_name: data.coach_name,
      contact_email: data.contact_email,
      logo_url: data.logo_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Team;
  },
};