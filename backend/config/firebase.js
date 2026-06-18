import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize Firebase only once
const app =
  getApps().length === 0
    ? initializeApp({
      credential: cert(serviceAccount),
    })
    : getApps()[0];

// Firestore Database
const db = getFirestore(app);

// Firebase Auth
const auth = getAuth(app);

export { db, auth };