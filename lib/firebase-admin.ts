import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required Firebase environment variable: ${name}`);
  return value;
}

function getPrivateKey() {
  const value = requiredEnv("FIREBASE_PRIVATE_KEY").trim();
  const unquoted = value.replace(/^(["'])|(["'])$/g, "");
  return unquoted.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
}

let firebaseAdminApp: App | undefined;

function getFirebaseAdminApp() {
  if (firebaseAdminApp) return firebaseAdminApp;
  firebaseAdminApp = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: requiredEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getPrivateKey(),
    }),
  });
  return firebaseAdminApp;
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseAdminApp());
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
