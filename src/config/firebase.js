import admin from "firebase-admin";
import dotenv from "dotenv";
import { FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_DATABASE_URL } from './constants.js';

dotenv.config();

const serviceAccount = JSON.parse(
  Buffer.from(FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DATABASE_URL
});

const db = admin.firestore();

export { admin, db };
