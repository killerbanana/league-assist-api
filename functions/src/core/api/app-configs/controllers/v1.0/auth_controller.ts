import { Request, Response } from "express";
import { HttpStatusCode } from "src/core/enums/Http-status-code";
import AuthService from "../../services/v1.0/auth_services";
import { HttpError } from "src/core/exceptions/http_error";
const jwt = require("jsonwebtoken");

class UserController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: HttpStatusCode.BAD_REQUEST,
          message: "Email and password are required.",
          data: null,
        });
      }

      const { idToken, user } = await AuthService.signInAndGetIdToken(email, password);

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Login successful",
        data: {
          token: idToken,
          user: user,
        },
      });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          status: error.statusCode,
          message: error.message,
          data: null,
        });
      }
      console.error("Error in UserController.login:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred during login.",
        data: null,
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const uid = (req as any).user?.uid;

      if (!uid) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          status: HttpStatusCode.UNAUTHORIZED,
          message: "Authentication required: User ID not found in token.",
          data: null,
        });
      }

      const success = await AuthService.logout(uid);

      if (!success) {
        throw new Error("Token revocation failed at the service layer.");
      }

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "User logged out successfully.",
        data: null,
      });
    } catch (error: any) {
      console.error("Error in UserController.logout:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred during logout.",
        data: null,
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password, displayName, roles } = req.body;

      if (!email || !password || !displayName) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: HttpStatusCode.BAD_REQUEST,
          message: "Missing required fields: email, password, displayName",
          data: null,
        });
      }

      const userId = await AuthService.registerUser({ email, password, displayName, roles });

      return res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "User registered successfully",
        data: { id: userId },
      });
    } catch (error: any) {
      console.error("Error in UserController.register:", error);
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          status: error.statusCode,
          message: error.message,
          data: null,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred during registration.",
        data: null,
      });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { uid } = req.params;

      const user = await AuthService.getUser(uid);

      if (!user) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          status: HttpStatusCode.NOT_FOUND,
          message: "User not found",
          data: null,
        });
      }

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "User fetched successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Error in UserController.get:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while fetching the user.",
        data: null,
      });
    }
  }

  static async all(req: Request, res: Response) {
    try {
      const users = await AuthService.allUsers();

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error: any) {
      console.error("Error in UserController.all:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while fetching users.",
        data: null,
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const { displayName, roles } = req.body;

      if (!displayName && !roles) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: HttpStatusCode.BAD_REQUEST,
          message: "No fields to update. Provide displayName or roles.",
          data: null,
        });
      }

      const success = await AuthService.updateUser(uid, { displayName, roles });

      if (!success) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          status: HttpStatusCode.NOT_FOUND,
          message: "User not found or update failed.",
          data: null,
        });
      }

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "User updated successfully",
        data: null,
      });
    } catch (error: any) {
      console.error("Error in UserController.update:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while updating the user.",
        data: null,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { uid } = req.params;

      const success = await AuthService.deleteUser(uid);

      if (!success) {
        return res.status(HttpStatusCode.NOT_FOUND).json({
          status: HttpStatusCode.NOT_FOUND,
          message: "User not found or delete failed.",
          data: null,
        });
      }

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "User deleted successfully",
        data: null,
      });
    } catch (error: any) {
      console.error("Error in UserController.delete:", error);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred while deleting the user.",
        data: null,
      });
    }
  }

  /**
   * Registers a new administrator.
   * This is a protected action that requires the requester to be an admin.
   */
  static async registerAdmin(req: Request, res: Response) {
    try {
      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          status: HttpStatusCode.BAD_REQUEST,
          message: "Missing required fields: email, password, displayName",
          data: null,
        });
      }

      const userId = await AuthService.registerAdmin({ email, password, displayName });

      return res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "Admin user registered successfully",
        data: { id: userId },
      });
    } catch (error: any) {
      console.error("Error in UserController.registerAdmin:", error);

      if (error.message.includes("is already in use")) {
        return res.status(HttpStatusCode.CONFLICT).json({
          status: HttpStatusCode.CONFLICT,
          message: error.message,
          data: null,
        });
      }

      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "An error occurred during admin registration.",
        data: null,
      });
    }
  }

  /**
   * @description Generates and sends a short-lived API key to the client.
   * The client should call this endpoint to get a key.
   */
  static async generate_api_key(req: Request, res: Response) {
    try {
      const appName = process.env.APP_NAME;
      const issuer = process.env.ISSUER;
      const secret = process.env.ACCESS_TOKEN_SECRET as string;

      if (!appName || !issuer || !secret) {
        console.error("Server configuration error: Missing API key environment variables.");
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
          message: "Cannot process request due to a server configuration error.",
        });
      }

      const payload = {
        name: appName,
      };

      const options = {
        issuer: issuer,
        expiresIn: "15m",
      };

      const token = jwt.sign(payload, secret, options);

      return res.status(HttpStatusCode.OK).send({ apiKey: token });
    } catch (err) {
      console.error("Error generating API key:", err);
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
        message: "An error occurred while generating the API key.",
      });
    }
  }
}

export default UserController;
