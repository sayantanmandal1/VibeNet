const admin = require('firebase-admin');
require('dotenv').config();

// For development, we'll use a simpler approach
// In production, you should use proper service account credentials

const firebaseConfig = {
  projectId: "social-media-2382d",
  // We'll verify tokens using the public keys from Google
};

// Initialize Firebase Admin SDK with minimal config for token verification
if (!admin.apps.length) {
  try {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        type: "service_account",
        project_id: "social-media-2382d",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback: Initialize with project ID only for token verification
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  } catch (error) {
    console.warn('Firebase Admin initialization warning:', error.message);
    // Initialize with minimal config
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

module.exports = admin;