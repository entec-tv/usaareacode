import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent, type Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey:
    import.meta.env["VITE_FIREBASE_API_KEY"] ?? "AIzaSyCmoHHtvl8pL4Jip3FPfCMkwkDtDe34bDI",
  authDomain:
    import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "en-tec-area-codes.firebaseapp.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] ?? "en-tec-area-codes",
  storageBucket:
    import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "en-tec-area-codes.firebasestorage.app",
  messagingSenderId:
    import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "262536268781",
  appId:
    import.meta.env["VITE_FIREBASE_APP_ID"] ?? "1:262536268781:web:b2acdc96cab2390660b5e4",
};

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!dbInstance) dbInstance = getFirestore(a);
  return dbInstance;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured) return null;
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => {
        const a = getFirebaseApp();
        if (supported && a) {
          return getAnalytics(a);
        }
        return null;
      })
      .catch(() => null);
  }
  return analyticsPromise;
}

/**
 * Safely logs an event to Firebase Analytics without blocking or throwing errors during SSR.
 */
export function trackAnalyticsEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  getFirebaseAnalytics()
    .then((analytics) => {
      if (analytics) {
        logEvent(analytics, eventName, params);
      }
    })
    .catch(() => {});
}

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super("Firebase is not configured yet. Add your project keys in src/lib/firebase.ts or .env.local.");
    this.name = "FirebaseNotConfiguredError";
  }
}

export function requireDb(): Firestore {
  const db = getDb();
  if (!db) throw new FirebaseNotConfiguredError();
  return db;
}

