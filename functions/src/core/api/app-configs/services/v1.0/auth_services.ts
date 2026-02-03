import * as admin from "firebase-admin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase-admin/firestore";
import App from "src/core/App";
import { Role } from "src/core/enums/Roles";
import { UserModel, userModelConverter } from "src/core/models/v1/auth/user_model";

import {
  BadRequestError,
  ConflictError,
  HttpError,
  InternalServerError,
  NotFoundError,
} from "src/core/exceptions/http_error";

interface SignInResult {
  idToken: string;
  user: UserModel | null;
}

class AuthService {
  static async signInAndGetIdToken(email: string, password: string): Promise<SignInResult> {
    try {
      const clientAuth = App.getClientAuth();

      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);

      const idToken = await userCredential.user.getIdToken();
      const authUser = userCredential.user;

      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(authUser.uid).withConverter(userModelConverter).get();

      if (!userDoc.exists || !userDoc.data()) {
        throw new NotFoundError(`User profile not found for UID: ${authUser.uid}`);
      }
      return { idToken, user: userDoc.data()! };
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        throw new BadRequestError("Invalid email or password.");
      }
      console.error(`Unexpected error:`, error);
      throw new InternalServerError("An unexpected error occurred during sign-in.");
    }
  }

  static async registerUser(data: {
    email: string;
    password: string;
    displayName: string;
    roles?: string[];
  }): Promise<string> {
    const { email, password, displayName, roles } = data;

    if (!email || !password || !displayName) {
      throw new Error("Email, password, and displayName are required.");
    }

    const assignableRoles: string[] = [
      Role.Player,
      Role.Spectator,
      Role.TournamentDirector,
      Role.SiteDirector,
      Role.Scorekeeper,
    ];
    let finalRoles: string[];

    if (roles && roles.length > 0) {
      const allRolesAreValid = roles.every((role) => assignableRoles.includes(role as Role));

      if (!allRolesAreValid) {
        throw new BadRequestError(`Invalid role provided.`);
      }
      finalRoles = roles;
    } else {
      finalRoles = [Role.Spectator];
    }

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, { roles: roles });

      const db = admin.firestore();
      const userDocRef = db.collection("users").doc(userRecord.uid).withConverter(userModelConverter);

      await userDocRef.set({
        id: userRecord.uid,
        email,
        displayName,
        roles: finalRoles,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ai_tokens: 0,
        coins: 0,
      });

      console.log(`Successfully created new user: ${userRecord.uid} with roles: ${finalRoles.join(", ")}`);
      return userRecord.uid;
    } catch (error: any) {
      console.error("Error registering user:", error.message);
      if (error.code === "auth/email-already-exists") {
        throw new Error("The email address is already in use.");
      }

      throw error;
    }
  }

  static async logout(uid: string): Promise<boolean> {
    try {
      await admin.auth().revokeRefreshTokens(uid);
      console.log(`Successfully revoked refresh tokens for user: ${uid}`);
      return true;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new NotFoundError(`Cannot log out. User with UID: ${uid} not found.`);
      }
      console.error(`Error revoking tokens for user ${uid}:`, error);
      throw new InternalServerError("An unexpected error occurred during logout.");
    }
  }

  /**
   * READ (Single): Retrieves a single user document from Firestore by UID.
   * @param uid - The User ID.
   * @returns A User object or null if not found.
   */
  static async getUser(uid: string): Promise<UserModel | null> {
    try {
      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(uid).withConverter(userModelConverter).get();

      if (!userDoc.exists || !userDoc.data()) {
        throw new NotFoundError(`User with UID: ${uid} not found.`);
      }

      return userDoc.data()!;
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }
      console.error(`Error fetching user ${uid}:`, error);
      throw new InternalServerError("An unexpected error occurred while fetching the user.");
    }
  }

  static async allUsers(): Promise<UserModel[]> {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection("users").withConverter(userModelConverter).get();

      if (snapshot.empty) {
        console.log("No users found.");
        return [];
      }

      return snapshot.docs.map((doc) => doc.data());
    } catch (error: any) {
      console.error("Error fetching all users:", error);
      throw new InternalServerError("An unexpected error occurred while fetching users.");
    }
  }

  static async updateUser(uid: string, data: Partial<{ displayName: string; roles: string[] }>): Promise<boolean> {
    try {
      const db = admin.firestore();
      const userDocRef = db.collection("users").doc(uid);

      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        throw new NotFoundError(`Cannot update. User with UID: ${uid} not found.`);
      }

      const firestoreUpdateData: any = { ...data, updatedAt: Timestamp.now() };
      await userDocRef.update(firestoreUpdateData);

      if (data.displayName) {
        await admin.auth().updateUser(uid, { displayName: data.displayName });
      }

      console.log(`Successfully updated user: ${uid}`);
      return true;
    } catch (error: any) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error.code === "auth/user-not-found") {
        throw new NotFoundError(`Cannot update. User with UID: ${uid} not found in Firebase Auth.`);
      }
      console.error(`Error updating user ${uid}:`, error);
      throw new InternalServerError("An unexpected error occurred while updating the user.");
    }
  }

  static async deleteUser(uid: string): Promise<boolean> {
    try {
      await admin.auth().deleteUser(uid);

      const db = admin.firestore();
      await db.collection("users").doc(uid).delete();

      console.log(`Successfully deleted user ${uid} from Auth and Firestore.`);
      return true;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new NotFoundError(`Cannot delete. User with UID: ${uid} not found.`);
      }
      console.error(`Error deleting user ${uid}:`, error);
      throw new InternalServerError("An unexpected error occurred while deleting the user.");
    }
  }

  static async getCoinTransactions(uid: string, page: number = 1, limit: number = 10): Promise<any> {
    const db = admin.firestore();
    try {
      const collectionRef = db.collection("coin_transactions");
      const query = collectionRef.where("user_id", "==", uid).orderBy("created_at", "desc");

      // Get total count
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;
      const totalPages = Math.ceil(total / limit);

      // Get paginated data
      const offset = (page - 1) * limit;
      const snapshot = await query.offset(offset).limit(limit).get();

      if (snapshot.empty) {
        return { transactions: [], total, totalPages, currentPage: page };
      }

      const transactions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });

      return { transactions, total, totalPages, currentPage: page };
    } catch (error) {
      console.error(`Error fetching coin transactions for user ${uid}:`, error);
      throw new InternalServerError("Failed to fetch coin transactions.");
    }
  }

  /**
   * ✨ NEW: Registers an admin user.
   * Should only be called from a protected endpoint that verifies the requester is an admin.
   */
  static async registerAdmin(data: { email: string; password: string; displayName: string }): Promise<string> {
    const { email, password, displayName } = data;

    if (!email || !password || !displayName) {
      throw new BadRequestError("Email, password, and displayName are required for admin registration.");
    }

    return this._createUserWithRoles({ email, password, displayName }, [Role.Admin]);
  }

  /**
   * Private helper method to create a user in Auth and Firestore with specified roles.
   * @param data - User details (email, password, displayName).
   * @param roles - An array of roles to assign to the user.
   * @returns The new user's UID.
   */
  private static async _createUserWithRoles(
    data: { email: string; password: string; displayName: string },
    roles: string[]
  ): Promise<string> {
    const { email, password, displayName } = data;
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, { roles: roles });

      const db = admin.firestore();
      const userDocRef = db.collection("users").doc(userRecord.uid).withConverter(userModelConverter);

      await userDocRef.set({
        id: userRecord.uid,
        email,
        displayName,
        roles: roles,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ai_tokens: 0,
        coins: 0,
      });

      console.log(`Successfully created new user: ${userRecord.uid} with roles: ${roles.join(", ")}`);
      return userRecord.uid;
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        throw new ConflictError("The email address is already in use by another account.");
      }
      console.error("Error creating user:", error);
      throw new InternalServerError("An unexpected error occurred while creating the user.");
    }
  }
}


export default AuthService;
