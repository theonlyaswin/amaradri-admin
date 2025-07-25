import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase, get, ref as dbRef } from 'firebase/database';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Replace with your own Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function fetchGalleryImagesOrdered() {
    // 1. Fetch order and ids from realtime db
    const snapshot = await get(dbRef(database, 'livegallery'));
    const data = snapshot.val();
    if (!data || !Array.isArray(data)) return [];
    // 2. For each id, get download URL from storage
    const images = await Promise.all(
        data
            .sort((a, b) => a.order - b.order)
            .map(async ({ id, order }) => {
                const fileRef = storageRef(storage, `livegallery/${id}`);
                const url = await getDownloadURL(fileRef);
                return { id, url, order };
            })
    );
    return images;
} 