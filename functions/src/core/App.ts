import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { Route } from "src/core/router/Route";
import * as admin from "firebase-admin";
import { getApp } from "firebase/app";
import { Auth as ClientAuth, getAuth } from "firebase/auth";

const app: Application = express();
let clientAuthInstance: ClientAuth;

class App {
  static boot() {
    const whitelist = [
      "https://www.sportspilotai.com",
      "https://sports-pilot-ai-website-git-staging-sports-pilot-ai.vercel.app",
    ];

    const corsOptions = {
      origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if ((origin && whitelist.indexOf(origin) !== -1) || !origin || origin.startsWith("http://localhost:")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    };
    app.use(cors(corsOptions));
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));
    app.use(cookieParser());

    // Get the client auth instance after initialization in index.ts
    clientAuthInstance = getAuth(getApp());

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).send("Internal Server Error");
    });

    Route.registerAll();
  }

  // Getter for the Admin App instance
  static getAdminApp() {
    return admin.app();
  }

  // Getter for the Client Auth instance
  static getClientAuth() {
    if (!clientAuthInstance) {
      throw new Error("Client Auth has not been initialized. Call App.boot() first.");
    }
    return clientAuthInstance;
  }

  static isProduction() {
    return process.env.ENVIRONMENT === "production";
  }

  static getInstance() {
    return app;
  }
}

export default App;
