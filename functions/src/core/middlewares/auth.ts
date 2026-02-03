import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";
import { HttpStatusCode } from "../enums/Http-status-code";
const jwt = require("jsonwebtoken");

declare module "express-serve-static-core" {
  interface Request {
    user?: admin.auth.DecodedIdToken;
    currentUser?: {
      uid: string;
      email?: string;
      roles: string[];
    };
  }
}

class Auth {
  static async handle_api_key(req: Request, res: Response, next: NextFunction) {
    const token = req.header("x-api-key");
    if (!token) {
      return res.status(HttpStatusCode.FORBIDDEN).send({
        message: "Access to the resource is prohibited.",
        status: HttpStatusCode.FORBIDDEN,
      });
    }

    try {
      const decoded: any = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
      const name = decoded.name;
      const issuer = decoded.iss;

      if (name === process.env.APP_NAME && issuer === process.env.ISSUER) {
        next();
        return;
      } else {
        return res.status(HttpStatusCode.FORBIDDEN).send({
          message: "Forbidden: Invalid API Key credentials.",
          status: HttpStatusCode.FORBIDDEN,
        });
      }
    } catch (err) {
      console.error("API Key verification error:", err);
      return res.status(HttpStatusCode.FORBIDDEN).send({
        message: "Forbidden: API Key verification failed.",
        status: HttpStatusCode.FORBIDDEN,
      });
    }
  }

  /**
   * [NEW METHOD] Creates a session cookie after verifying a Firebase ID token.
   * This should be called once by your frontend after a user signs in.
   */
  static async createSessionCookie(req: Request, res: Response) {
    try {
      const idToken = req.body.idToken;
      if (!idToken) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({ message: "ID token is required." });
      }

      // Decode the token first
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const signInProvider = decodedToken.firebase.sign_in_provider;

      // Check if the role claim doesn't exist for a Google sign-in
      if (!decodedToken.roles && signInProvider === "google.com") {
        // Set the custom claim with role as an array
        await admin.auth().setCustomUserClaims(uid, { roles: ["tournamentDirector"] });

        // Inform the client to refresh the token to get the new claim
        return res.status(HttpStatusCode.RESET_CONTENT).json({
          message: "Custom claims set. Please refresh your token.",
        });
      }

      // Set session expiration.
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

      const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none" as const,
      };

      res.cookie("session", sessionCookie, options);

      return res.status(HttpStatusCode.OK).json({ status: "success", message: "Session created." });
    } catch (error) {
      console.error("Session cookie creation error:", error);
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Failed to create session." });
    }
  }

  static async checkSession(req: Request, res: Response) {
    let decodedToken: admin.auth.DecodedIdToken;

    if (req.cookies.session) {
      try {
        decodedToken = await admin.auth().verifySessionCookie(req.cookies.session, true);
      } catch (error: any) {
        if (error.code === "auth/session-cookie-expired") {
          return res
            .status(HttpStatusCode.UNAUTHORIZED)
            .json({ message: "Your session has expired. Please sign in again." });
        }
        console.log(error);
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid session. Please sign in again." });
      }
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      const idToken = req.headers.authorization.split("Bearer ")[1];
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
        return res.status(HttpStatusCode.OK).json({ message: "OK" });
      } catch (error) {
        console.error("ID Token verification error:", error);
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid or expired authentication token." });
      }
    } else {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "The request is unauthenticated." });
    }

    try {
      req.user = decodedToken;
      const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        req.currentUser = { uid: decodedToken.uid, email: decodedToken.email, roles: ["player"] };
        return res.status(HttpStatusCode.OK).json({ message: "OK" });
      } else {
        req.currentUser = { uid: decodedToken.uid, email: decodedToken.email, roles: userDoc.data()?.roles || [] };
        return res.status(HttpStatusCode.OK).json({ message: "OK" });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error processing user authentication." });
    }
  }

  static async authenticateUser(req: Request, res: Response, next: NextFunction) {
    let decodedToken: admin.auth.DecodedIdToken;

    if (req.cookies.session) {
      try {
        decodedToken = await admin.auth().verifySessionCookie(req.cookies.session, true);
      } catch (error: any) {
        if (error.code === "auth/session-cookie-expired") {
          return res
            .status(HttpStatusCode.UNAUTHORIZED)
            .json({ message: "Your session has expired. Please sign in again." });
        }
        console.log(error);
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid session. Please sign in again." });
      }
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      const idToken = req.headers.authorization.split("Bearer ")[1];
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error("ID Token verification error:", error);
        return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Invalid or expired authentication token." });
      }
    } else {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "The request is unauthenticated." });
    }

    try {
      req.user = decodedToken;
      const userDoc = await admin.firestore().collection("users").doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        req.currentUser = { uid: decodedToken.uid, email: decodedToken.email, roles: ["player"] };
      } else {
        req.currentUser = { uid: decodedToken.uid, email: decodedToken.email, roles: userDoc.data()?.roles || [] };
      }
      return next();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Error processing user authentication." });
    }
  }

  static async authenticateUserOptional(req: Request, res: Response, next: NextFunction) {
    let decodedToken: admin.auth.DecodedIdToken | undefined;

    if (req.cookies.session) {
      try {
        decodedToken = await admin.auth().verifySessionCookie(req.cookies.session, true);
        console.log(decodedToken);
      } catch (error) {
        // Invalid cookie, ignore and proceed as a guest
      }
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      const idToken = req.headers.authorization.split("Bearer ")[1];
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        // Invalid token, ignore and proceed as a guest
      }
    }

    if (decodedToken) {
      console.log(decodedToken);
      req.currentUser = { uid: decodedToken.uid, email: decodedToken.email, roles: decodedToken.roles || [] };
    }

    // Always proceed, whether a user was identified or not
    return next();
  }

  static authorizeRoles(requiredRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.currentUser) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          status: HttpStatusCode.UNAUTHORIZED,
          message: "Authentication context missing. Ensure authenticateUser middleware runs before authorizeRoles.",
          data: null,
        });
      }

      const userRoles = req.currentUser.roles || [];
      const hasPermission = requiredRoles.some((role) => userRoles.includes(role));

      console.log(userRoles);

      if (hasPermission) {
        next();
        return; // Keep 'return;' for clarity after next()
      } else {
        console.warn(
          `User ${req.currentUser.uid} with roles [${userRoles.join(
            ", "
          )}] attempted unauthorized access. Required: [${requiredRoles.join(", ")}]`
        );
        return res.status(HttpStatusCode.FORBIDDEN).json({
          status: HttpStatusCode.FORBIDDEN,
          message: "Forbidden: You do not have the necessary permissions for this action.",
          data: null,
        });
      }
    };
  }

  static async logout(req: Request, res: Response) {
    try {
      // The options must match the options used when the cookie was set
      const options = {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "none" as const,
      };

      res.clearCookie("session", options);

      return res.status(HttpStatusCode.OK).json({ status: "success", message: "Logged out successfully." });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to log out." });
    }
  }
}

export default Auth;
