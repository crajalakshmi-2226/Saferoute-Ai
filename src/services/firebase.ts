import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  getDocFromServer,
} from 'firebase/firestore';

// Import from provisioned config
import rawFirebaseConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || rawFirebaseConfig.firestoreDatabaseId,
};

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Standard Firestore error handler per skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory testConnection function as per Firebase integration skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection notice: client is offline or database initializing.');
    }
  }
}

if (typeof window !== 'undefined' && isFirebaseConfigured) {
  testConnection();
}

// User Profile model in Firestore
export interface UserProfileData {
  uid: string;
  fullName: string;
  email: string;
  currentLocationName?: string;
  currentLocationLat?: number;
  currentLocationLng?: number;
  mobilityProfile?: string;
  mobilityPreferences?: Record<string, any>;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Save or update user profile in Firestore
export async function saveUserProfile(data: UserProfileData): Promise<void> {
  const path = `users/${data.uid}`;
  try {
    const userDocRef = doc(db, 'users', data.uid);
    const payload: UserProfileData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (!payload.createdAt) {
      payload.createdAt = new Date().toISOString();
    }
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Confidential Incident Report Model in Firestore
export interface EvidenceFileItem {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  uploadedAt: string;
  previewUrl?: string;
}

export interface IncidentReportData {
  id: string;
  userId: string;
  category: string;
  description: string;
  incidentDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  preferredLanguage?: 'en' | 'ta';
  desiredAssistance?: string;
  complaintDraft?: string;
  status: 'draft_created' | 'ready_for_review' | 'opened_official_channel' | 'submitted_confirmed';
  receivingAuthority?: string;
  officialPortalUrl?: string;
  evidenceFiles?: EvidenceFileItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Save or create an incident report in Firestore under users/{userId}/reports/{reportId}
export async function saveIncidentReport(report: IncidentReportData): Promise<string> {
  const reportId = report.id || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${report.userId}/reports/${reportId}`;
  try {
    const reportDocRef = doc(db, 'users', report.userId, 'reports', reportId);
    const cleanPayload: IncidentReportData = {
      ...report,
      id: reportId,
      createdAt: report.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Strip large local blob preview URLs before persisting to Firestore
    if (cleanPayload.evidenceFiles) {
      cleanPayload.evidenceFiles = cleanPayload.evidenceFiles.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        sizeBytes: file.sizeBytes,
        uploadedAt: file.uploadedAt,
      }));
    }
    await setDoc(reportDocRef, cleanPayload, { merge: true });
    return reportId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return reportId;
  }
}

// Fetch all confidential incident reports for the authenticated user
export async function getUserIncidentReports(userId: string): Promise<IncidentReportData[]> {
  const path = `users/${userId}/reports`;
  try {
    const reportsCollRef = collection(db, 'users', userId, 'reports');
    const snapshot = await getDocs(reportsCollRef);
    const reports: IncidentReportData[] = [];
    snapshot.forEach((docSnap) => {
      reports.push(docSnap.data() as IncidentReportData);
    });
    // Sort descending by creation date
    return reports.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Delete an incident report
export async function deleteIncidentReport(userId: string, reportId: string): Promise<void> {
  const path = `users/${userId}/reports/${reportId}`;
  try {
    const reportDocRef = doc(db, 'users', userId, 'reports', reportId);
    await deleteDoc(reportDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Update report status
export async function updateIncidentReportStatus(
  userId: string,
  reportId: string,
  status: IncidentReportData['status']
): Promise<void> {
  const path = `users/${userId}/reports/${reportId}`;
  try {
    const reportDocRef = doc(db, 'users', userId, 'reports', reportId);
    await updateDoc(reportDocRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Auth wrappers
export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string, fullName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (credential.user) {
    await updateProfile(credential.user, { displayName: fullName });
  }
  return credential;
}

export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  return await signOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
