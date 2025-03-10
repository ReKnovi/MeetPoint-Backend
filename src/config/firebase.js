// File: src/config/firebase.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import { FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_DATABASE_URL } from './constants.js';

dotenv.config();

const serviceAccount = JSON.parse(fs.readFileSync(FIREBASE_SERVICE_ACCOUNT_KEY, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DATABASE_URL
});

const db = admin.firestore();

export { admin, db };