import { Timestamp, FirestoreDataConverter } from "firebase-admin/firestore";

export type SubscriptionDetail = {
  subscription_id: string;
  price_id: string;
  product_id: string;
  subscribed_at: Timestamp;
  expires_at: Timestamp;
  cancel_at_period_end: boolean;
  currency: string;
  amount: number;
  interval: string;
  product_name?: string;
  metadata?: { [key: string]: string };
};

export interface UserModel {
  id?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  coins?: number;
  ai_tokens?: number;
  subscriptions?: SubscriptionDetail[];
  roles?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  last_login?: Timestamp;
  tournamentIds?: string[];
}

export const userModelConverter: FirestoreDataConverter<UserModel> = {
  toFirestore(user: UserModel): FirebaseFirestore.DocumentData {
    const { id, ...data } = user;
    return data;
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): UserModel {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email,
      ...data,
    } as UserModel;
  },
};