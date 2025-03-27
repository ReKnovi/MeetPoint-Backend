import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Decode environment variable (handle newline issue)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { admin, db };
