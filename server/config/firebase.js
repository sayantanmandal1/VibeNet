const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we have valid Firebase credentials
    const hasValidCredentials = 
      process.env.FIREBASE_PRIVATE_KEY && 
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY !== "-----BEGIN PRIVATE KEY-----\nyour-private-key-from-service-account\n-----END PRIVATE KEY-----\n";

    if (hasValidCredentials) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || "social-media-2382d",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
      };
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('Firebase Admin initialized with service account credentials');
    } else {
      // Development mode: Initialize with project ID only
      console.log('Firebase Admin initialized in development mode (no service account)');
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "social-media-2382d",
      });
    }
  } catch (error) {
    console.warn('Firebase Admin initialization warning:', error.message);
    // Fallback: Initialize with minimal config
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "social-media-2382d",
    });
  }
}

module.exports = admin;