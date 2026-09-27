import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  getDocs, 
  getDocsFromCache,
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut as fbSignOut
} from 'firebase/auth';
import { Property } from '../types/property';
import { compressDataUrl } from './imageUtils';

export const firebaseConfig = {
  projectId: "zesty-machine-8ds98",
  appId: "1:333503718048:web:ca82fec931a49a91fb9fc5",
  apiKey: "AIzaSyCBmKoW4TN6rHWWf7-luXhsr34WeVoEzbs",
  authDomain: "zesty-machine-8ds98.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-lbnegciosimobili-3b92fbcf-0037-4007-80e3-5bd850909eff",
  storageBucket: "zesty-machine-8ds98.firebasestorage.app",
  messagingSenderId: "333503718048",
  measurementId: "",
  oAuthClientId: "333503718048-j5p47g6h8ignmdbm3r04se1sq7hrac7j.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// Admin authentication credentials
export const AUTHORIZED_ADMIN_LOGIN = 'lbnegociosimobiliarios';
export const AUTHORIZED_ADMIN_PASSWORD = 'lbnegociosimobiliarios1609#';
export const CANONICAL_ADMIN_EMAIL = 'lbnegociosimobiliarios@admin.lbimoveis.com.br';

export function isAuthorizedAdminAccount(input: string | null | undefined): boolean {
  if (!input) return false;
  const clean = input.trim().toLowerCase();
  return clean === AUTHORIZED_ADMIN_LOGIN.toLowerCase() ||
         clean === CANONICAL_ADMIN_EMAIL.toLowerCase();
}

export function isAuthorizedAdminPassword(input: string | null | undefined): boolean {
  if (!input) return false;
  return input.trim() === AUTHORIZED_ADMIN_PASSWORD;
}

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache to reduce read quota usage
export const db = initializeFirestore(app, { 
  ignoreUndefinedProperties: true,
  localCache: typeof window !== 'undefined' ? persistentLocalCache({ tabManager: persistentMultipleTabManager() }) : undefined
}, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

const COLLECTION_NAME = 'properties';

export async function getPropertiesFromFirestore(): Promise<Property[]> {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  // 1. Try reading from Firestore persistent local cache first (instant and doesn't hit daily quota)
  try {
    const cacheSnap = await getDocsFromCache(q);
    if (!cacheSnap.empty) {
      const properties: Property[] = [];
      cacheSnap.forEach((docSnapshot) => {
        properties.push({
          id: docSnapshot.id,
          ...docSnapshot.data()
        } as Property);
      });
      if (properties.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lb_cached_properties_v2', JSON.stringify(properties));
        }
        return properties;
      }
    }
  } catch {
    // Proceed to network or localStorage
  }

  // 2. Try fetching from network/Firestore server
  try {
    const snapshot = await getDocs(q);
    const properties: Property[] = [];
    snapshot.forEach((docSnapshot) => {
      properties.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      } as Property);
    });

    if (properties.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem('lb_cached_properties_v2', JSON.stringify(properties));
      } catch {
        // Continue
      }
    }

    return properties;
  } catch (error) {
    console.warn('Firestore read error, falling back to local cache:', error);
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('lb_cached_properties_v2');
      if (cached) {
        try {
          return JSON.parse(cached) as Property[];
        } catch {
          // parse error
        }
      }
    }
    return [];
  }
}

export function subscribeToProperties(onUpdate: (properties: Property[]) => void): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const properties: Property[] = [];
          snapshot.forEach((docSnapshot) => {
            properties.push({
              id: docSnapshot.id,
              ...docSnapshot.data()
            } as Property);
          });

          if (properties.length > 0 && typeof window !== 'undefined') {
            try {
              localStorage.setItem('lb_cached_properties_v2', JSON.stringify(properties));
            } catch {
              // LocalStorage quota may be reached
            }
          }
          onUpdate(properties);
        } else {
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('lb_cached_properties_v2');
            if (cached) {
              try {
                onUpdate(JSON.parse(cached) as Property[]);
              } catch {
                // error
              }
            }
          }
        }
      },
      (error) => {
        console.warn('Realtime subscription error, using local cache:', error);
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('lb_cached_properties_v2');
          if (cached) {
            try {
              onUpdate(JSON.parse(cached) as Property[]);
            } catch {
              // error
            }
          }
        }
      }
    );
  } catch (err) {
    console.warn('Failed to attach realtime snapshot:', err);
    return () => {};
  }
}

export async function savePropertyToFirestore(property: Omit<Property, 'id'> & { id?: string }): Promise<string> {
  const propertyId = property.id || `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Compress and optimize all property images
  const processedImages = await Promise.all(
    (property.images || []).map(async (img) => {
      if (img.url.startsWith('data:image/')) {
        const targetWidth = (property.images?.length || 1) > 6 ? 960 : 1200;
        const targetQuality = (property.images?.length || 1) > 6 ? 0.65 : 0.72;
        const compressed = await compressDataUrl(img.url, targetWidth, targetQuality);
        return {
          ...img,
          url: compressed
        };
      }
      return img;
    })
  );

  let propertyData: Property = {
    ...property,
    id: propertyId,
    images: processedImages,
    updatedAt: now,
    createdAt: property.createdAt || now
  };

  // Ensure overall document size is well within the 1MB Firestore limit
  let jsonString = JSON.stringify(propertyData);
  if (jsonString.length > 800000) {
    const furtherCompressedImages = await Promise.all(
      propertyData.images.map(async (img) => {
        if (img.url.startsWith('data:image/')) {
          const comp = await compressDataUrl(img.url, 800, 0.55);
          return { ...img, url: comp };
        }
        return img;
      })
    );
    propertyData = {
      ...propertyData,
      images: furtherCompressedImages
    };
  }

  // Ensure authenticated session
  if (!auth.currentUser) {
    try {
      await signInWithEmailAndPassword(auth, CANONICAL_ADMIN_EMAIL, AUTHORIZED_ADMIN_PASSWORD);
    } catch {
      try {
        await createUserWithEmailAndPassword(auth, CANONICAL_ADMIN_EMAIL, AUTHORIZED_ADMIN_PASSWORD);
      } catch {
        try {
          await signInAnonymously(auth);
        } catch {
          // Proceed
        }
      }
    }
  }

  const docRef = doc(db, COLLECTION_NAME, propertyId);
  await setDoc(docRef, propertyData, { merge: true });

  // Update local cache immediately so the UI reflects it instantly without network delay
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('lb_cached_properties_v2');
      const list: Property[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(p => p.id === propertyId || p.code === propertyData.code);
      if (idx >= 0) {
        list[idx] = propertyData;
      } else {
        list.unshift(propertyData);
      }
      localStorage.setItem('lb_cached_properties_v2', JSON.stringify(list));
    } catch {
      // Continue
    }
  }

  return propertyId;
}

export async function deletePropertyFromFirestore(propertyId: string): Promise<void> {
  // Update local cache immediately
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('lb_cached_properties_v2');
      if (raw) {
        const list: Property[] = JSON.parse(raw);
        const filtered = list.filter(p => p.id !== propertyId);
        localStorage.setItem('lb_cached_properties_v2', JSON.stringify(filtered));
      }
    } catch {
      // Continue
    }
  }
  if (!auth.currentUser) {
    try {
      await signInWithEmailAndPassword(auth, CANONICAL_ADMIN_EMAIL, AUTHORIZED_ADMIN_PASSWORD);
    } catch {
      try {
        await signInAnonymously(auth);
      } catch {
        // Proceed
      }
    }
  }

  const docRef = doc(db, COLLECTION_NAME, propertyId);
  await deleteDoc(docRef);
}

export { fbSignOut };
