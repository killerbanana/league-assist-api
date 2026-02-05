import { Timestamp, FirestoreDataConverter, QueryDocumentSnapshot } from "firebase-admin/firestore";

export interface Player {
  id?: string;
  name: string;
  position: string;
  team: string;
  jerseyNumber: number;
  isActive: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export const playerConverter: FirestoreDataConverter<Player> = {
  toFirestore(player: Player): FirebaseFirestore.DocumentData {
    const data = { ...player };
    if (data.id) delete data.id;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Player {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      position: data.position,
      team: data.team,
      jerseyNumber: data.jerseyNumber,
      isActive: data.isActive,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Player;
  },
};
