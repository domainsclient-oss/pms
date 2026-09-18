import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

let clientAuth: ReturnType<typeof getAuth> | undefined;

export function getClientAuth() {
  if (clientAuth) return clientAuth;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAG0cdtnGu3wi4zLzAZq56xl_otap5dXYk";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "wezigns-dbcd4";
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
