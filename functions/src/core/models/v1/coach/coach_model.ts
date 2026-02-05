import { Timestamp, FirestoreDataConverter, QueryDocumentSnapshot } from "firebase-admin/firestore";

export interface Coach {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  team_id?: string;
  role?: string; // e.g., "Head Coach", "Assistant Coach"
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export const coachConverter: FirestoreDataConverter<Coach> = {
  toFirestore(coach: Coach): FirebaseFirestore.DocumentData {
    const data = { ...coach };
    if (data.id) delete data.id;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Coach {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      team_id: data.team_id,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Coach;
  },
};