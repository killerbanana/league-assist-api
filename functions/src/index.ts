import dotenv from "dotenv";
import * as admin from "firebase-admin";
import * as firebaseFunctions from "firebase-functions/v1";
import * as ModuleAlias from "module-alias";
import { initializeApp as initializeClientApp } from "firebase/app";

const path = require("path");
const fs = require("fs");

let projectRoot = __dirname;
while (!fs.existsSync(path.join(projectRoot, "package.json"))) {
    projectRoot = path.dirname(projectRoot);
}

const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";
let shellEnv = process.env.ENVIRONMENT && process.env.ENVIRONMENT.trim();

// Force production environment if running in emulator with production project ID
// This overrides "local" environment that might be loaded from .env.local by Firebase CLI
if (isEmulator && process.env.GCLOUD_PROJECT === "vision2creation") {
    shellEnv = "production";
}

if (!shellEnv && !isEmulator && process.env.GCLOUD_PROJECT === "tourney-assist-ai") {
    shellEnv = "dev";
}

const searchOrder = shellEnv ? [`.env.${shellEnv}`] : (isEmulator ? [".env.local", ".env"] : [".env.production", ".env"]);
const envFileName = searchOrder.find(f => fs.existsSync(path.join(projectRoot, f))) || ".env";
const envPath = path.join(projectRoot, envFileName);

dotenv.config({ path: envPath, override: true  });

console.log(`[Startup] Loading config from: ${envPath}`);
console.log(`[Startup] Target Project ID: ${process.env.ADMIN_PROJECT_ID}`);

if (!admin.apps.length) {
    if (process.env.ENVIRONMENT === "production" && process.env.FUNCTIONS_EMULATOR !== "true") {
        admin.initializeApp();
    } else {
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.ADMIN_PROJECT_ID,
                clientEmail: process.env.ADMIN_CLIENT_EMAIL,
                privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : undefined,
            }),
            databaseURL: process.env.ADMIN_DATABASE_URL,
        });
    }
}

ModuleAlias.addAliases({
    src: __dirname,
});

// Initialize the Firebase Client SDK for client-side auth operations
const firebaseClientConfig = {
    apiKey: process.env.CLIENT_API_KEY,
    authDomain: process.env.CLIENT_AUTH_DOMAIN,
    projectId: process.env.ADMIN_PROJECT_ID,
};

initializeClientApp(firebaseClientConfig);

admin.firestore().settings({
    ignoreUndefinedProperties: true,
});

const functions = process.env.ENVIRONMENT === "production" ? firebaseFunctions.region("us-central1") : firebaseFunctions.region("asia-southeast1");

const appPath = process.env.ENVIRONMENT === "production" ? "src/prod/core/App" : "src/core/App";
const App = require(appPath).default;
App.boot();
exports.api = functions.https.onRequest(App.getInstance());