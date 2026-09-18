import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

let clientAuth: ReturnType<typeof getAuth> | undefined;

export function getClientAuth() {
  if (clientAuth) return clientAuth;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("Firebase client configuration is missing.");
  }
  const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        apiKey,
        authDomain: projectId + ".firebaseapp.com",
        projectId,
      });
  clientAuth = getAuth(firebaseApp);
  return clientAuth;
}
