import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase, get, ref as dbRef, set } from 'firebase/database';
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

// Function to generate a URL-friendly string
function generateUrlFriendlyId(title: string): string {
    const cleanTitle = title.toLowerCase().replace(/\s+/g, '');
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${cleanTitle}-${randomString}`;
}

// Save client gallery details
export async function saveClientGallery(data: {
    name: string;
    driveLink: string;
    title: string;
}) {
    try {
        const galleryRef = dbRef(database, 'client-gallery');
        const url = generateUrlFriendlyId(data.name);

        // Get existing galleries to check for duplicates
        const snapshot = await get(galleryRef);
        const galleries = snapshot.val() || {};

        // Check if name already exists
        const nameExists = Object.values(galleries).some((gallery: any) =>
            gallery.name.toLowerCase() === data.name.toLowerCase()
        );

        if (nameExists) {
            throw new Error('A gallery with this name already exists');
        }

        // Create new gallery entry
        const newGallery = {
            ...data,
            url,
            status: 'live',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to database
        await set(dbRef(database, `client-gallery/${data.name}`), newGallery);
        return { success: true, url };
    } catch (error) {
        console.error('Error saving client gallery:', error);
        throw error;
    }
}

// Type for client gallery data
export interface ClientGallery {
    name: string;
    driveLink: string;
    title: string;
    url: string;
    status: 'live' | 'hidden';
    createdAt: string;
    updatedAt: string;
}

// Fetch all client galleries
export async function fetchClientGalleries(): Promise<ClientGallery[]> {
    try {
        const galleryRef = dbRef(database, 'client-gallery');
        const snapshot = await get(galleryRef);
        const galleries = snapshot.val() || {};

        // Convert object to array and sort by createdAt
        return Object.values(galleries).map((gallery: any): ClientGallery => ({
            name: gallery.name,
            driveLink: gallery.driveLink,
            title: gallery.title,
            url: gallery.url,
            status: gallery.status,
            createdAt: gallery.createdAt,
            updatedAt: gallery.updatedAt
        })).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
        console.error('Error fetching client galleries:', error);
        throw error;
    }
}

// Delete client gallery
export async function deleteClientGallery(clientName: string): Promise<void> {
    try {
        const galleryRef = dbRef(database, `client-gallery/${clientName}`);
        await set(galleryRef, null);
    } catch (error) {
        console.error('Error deleting client gallery:', error);
        throw error;
    }
} 