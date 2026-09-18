import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + ".firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

export const clientAuth = getAuth(firebaseApp);
