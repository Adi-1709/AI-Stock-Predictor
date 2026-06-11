import admin from 'firebase-admin';

// Initialize Firebase Admin with service account credentials from environment variables
// Note: In a real production scenario, the private key should handle escaped newlines properly
const initializeFirebase = () => {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('⚡ [Database] Firebase Admin Initialized successfully');
  } catch (error) {
    console.error('⚠️ [Database] Firebase Admin initialization error:', error.stack);
  }
};

initializeFirebase();

export const db = admin.firestore();
export const auth = admin.auth();
export { admin };
