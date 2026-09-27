import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  getDocs, 
  getDocsFromCache,
  doc, 
  setDoc, 
  deleteDoc, 
  getDocFromServer,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Property } from '../types';
import { DEMO_PROPERTIES } from '../data/properties';
import { compressDataUrl } from './imageUtils';

// Master Authorized Admin Account mandated by the user
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

// Initialize Firestore with persistent cache to drastically reduce reads and save quota
export const db = firebaseConfig.firestoreDatabaseId 
  ? initializeFirestore(app, { 
      ignoreUndefinedProperties: true,
      localCache: typeof window !== 'undefined' ? persistentLocalCache({ tabManager: persistentMultipleTabManager() }) : undefined
    }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { 
      ignoreUndefinedProperties: true,
      localCache: typeof window !== 'undefined' ? persistentLocalCache({ tabManager: persistentMultipleTabManager() }) : undefined
    });

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Local cache keys
const LOCAL_PROPERTIES_KEY = 'lb_catalog_properties_cache_v2';

export function getLocalCachedProperties(): Property[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalCachedProperties(props: Property[]): void {
  try {
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(props));
  } catch (e) {
    console.warn('LocalStorage save failed, applying lightweight fallback:', e);
    try {
      // If full array exceeds localStorage 5MB quota, store lightweight version (first 2 images only per property)
      const lightweight = props.map(p => ({
        ...p,
        images: (p.images || []).slice(0, 2)
      }));
      localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(lightweight));
    } catch {
      // If still exceeding, keep only codes and metadata
      try {
        const minimal = props.map(p => ({
          ...p,
          images: (p.images || []).slice(0, 1).map(img => ({ ...img, url: img.url.substring(0, 2000) }))
        }));
        localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(minimal));
      } catch {
        // Safe failover
      }
    }
  }
}

// Recursively strips undefined keys and normalizes values for Firestore compatibility
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return '' as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

// Connection verification
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Verify configuration.');
    }
  }
}

// Fetch all properties from Firestore with local fallback
export async function getPropertiesFromFirestore(): Promise<Property[]> {
  const colRef = collection(db, 'properties');

  // 1. Try reading from Firestore persistent local cache first (instant and doesn't consume daily quota)
  try {
    const cacheSnap = await getDocsFromCache(colRef);
    if (!cacheSnap.empty) {
      const cachedProps: Property[] = [];
      cacheSnap.forEach((docSnap) => {
        cachedProps.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Property);
      });
      if (cachedProps.length > 0) {
        saveLocalCachedProperties(cachedProps);
        return cachedProps;
      }
    }
  } catch {
    // If persistent cache is empty, proceed to network/local storage
  }

  // 2. Try fetching from network/Firestore server
  try {
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const properties: Property[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        properties.push({
          id: docSnap.id,
          ...data,
        } as Property);
      });

      // Sync with local cache
      saveLocalCachedProperties(properties);
      return properties;
    }
  } catch (err) {
    console.warn('Could not read from Firestore network, falling back to local storage cache:', err);
  }

  // 3. Fallback to localStorage cache (which holds any newly saved or edited properties)
  const cached = getLocalCachedProperties();
  if (cached && cached.length > 0) {
    return cached;
  }

  return DEMO_PROPERTIES;
}

// Real-time listener for properties collection
export function subscribeToProperties(onUpdate: (properties: Property[]) => void): () => void {
  try {
    const colRef = collection(db, 'properties');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const properties: Property[] = [];
          snapshot.forEach((docSnap) => {
            properties.push({
              id: docSnap.id,
              ...docSnap.data()
            } as Property);
          });
          saveLocalCachedProperties(properties);
          onUpdate(properties);
        } else {
          const cached = getLocalCachedProperties();
          if (cached.length > 0) {
            onUpdate(cached);
          }
        }
      },
      (error) => {
        console.warn('Firestore snapshot error, preserving cached properties:', error);
        const cached = getLocalCachedProperties();
        if (cached.length > 0) {
          onUpdate(cached);
        }
      }
    );
  } catch (err) {
    console.warn('Could not setup Firestore listener:', err);
    return () => {};
  }
}

// Save or create a property in Firestore
export async function savePropertyToFirestore(property: Property): Promise<void> {
  const propertyId = property.id || `prop-${Date.now()}`;
  const docRef = doc(db, 'properties', propertyId);

  const cleanPayload = sanitizeForFirestore({
    ...property,
    id: propertyId,
    condoFee: property.condoFee || '',
    iptu: property.iptu || '',
    shortDescription: property.shortDescription || '',
    fullDescription: property.fullDescription || '',
    addressSummary: property.addressSummary || '',
    features: property.features || [],
    images: (property.images || []).map((img, idx) => ({
      url: img.url,
      alt: img.alt || `Foto ${idx + 1}`,
      caption: img.caption || ''
    })),
    updatedAt: new Date().toISOString(),
    createdAt: property.createdAt || new Date().toISOString()
  });

  // Check payload size and auto-compress images if approaching Firestore 1MB document limit
  let payloadStr = JSON.stringify(cleanPayload);
  let payloadBytes = new TextEncoder().encode(payloadStr).length;

  if (payloadBytes > 650000 && cleanPayload.images && cleanPayload.images.length > 0) {
    const count = cleanPayload.images.length;
    const targetDim = count > 10 ? 640 : (count > 6 ? 720 : 800);
    const targetQuality = count > 10 ? 0.48 : (count > 6 ? 0.54 : 0.60);

    const recompressed = await Promise.all(
      cleanPayload.images.map(async (img) => {
        if (img.url && img.url.startsWith('data:image/')) {
          const compUrl = await compressDataUrl(img.url, targetDim, targetQuality);
          return { ...img, url: compUrl };
        }
        return img;
      })
    );
    cleanPayload.images = recompressed;
    payloadStr = JSON.stringify(cleanPayload);
    payloadBytes = new TextEncoder().encode(payloadStr).length;

    // Safety second pass if still near 1MB
    if (payloadBytes > 950000) {
      const tightPass = await Promise.all(
        cleanPayload.images.map(async (img) => {
          if (img.url && img.url.startsWith('data:image/')) {
            const compUrl = await compressDataUrl(img.url, 560, 0.44);
            return { ...img, url: compUrl };
          }
          return img;
        })
      );
      cleanPayload.images = tightPass;
    }
  }

  // Always update local cache immediately so data is never lost
  try {
    const cached = getLocalCachedProperties();
    const existingIdx = cached.findIndex(p => p.id === propertyId || p.code === cleanPayload.code);
    if (existingIdx >= 0) {
      cached[existingIdx] = cleanPayload;
    } else {
      cached.unshift(cleanPayload);
    }
    saveLocalCachedProperties(cached);
  } catch (cacheErr) {
    console.warn('Could not update local properties cache:', cacheErr);
  }

  // Persist directly into Firestore
  try {
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (err: unknown) {
    console.error('Erro ao gravar no Firestore:', err);
    const errObj = err as { code?: string; message?: string };
    if (errObj?.code === 'permission-denied') {
      throw new Error('Permissão negada no Firestore. As regras de segurança foram atualizadas, tente novamente.');
    }
    if (errObj?.message && errObj.message.includes('exceeds maximum size')) {
      throw new Error('Tamanho total das fotos excede o limite do banco. Tente enviar menos fotos ou fotos menores.');
    }
    throw new Error(errObj?.message || 'Erro de comunicação ao salvar no banco de dados Firestore.');
  }
}

// Delete a property from Firestore
export async function deletePropertyFromFirestore(propertyId: string): Promise<void> {
  // Update local cache
  try {
    const cached = getLocalCachedProperties();
    saveLocalCachedProperties(cached.filter(p => p.id !== propertyId));
  } catch (e) {
    console.warn('Error updating local cache on delete:', e);
  }

  const docRef = doc(db, 'properties', propertyId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Erro ao excluir do Firestore:', err);
    throw err;
  }
}

// Seed demo properties into Firestore if empty
export async function seedPropertiesIfEmpty(): Promise<Property[]> {
  try {
    const existing = await getPropertiesFromFirestore();
    if (existing.length > 0) {
      return existing;
    }
    
    // Seed initial properties
    const batch = writeBatch(db);
    for (const prop of DEMO_PROPERTIES) {
      const docRef = doc(db, 'properties', prop.id);
      const clean = sanitizeForFirestore({
        ...prop,
        isDemonstration: false, // Convert to live catalog
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      batch.set(docRef, clean);
    }
    await batch.commit();
    return await getPropertiesFromFirestore();
  } catch (err) {
    console.warn('Could not seed initial properties to Firestore:', err);
    saveLocalCachedProperties(DEMO_PROPERTIES);
    return DEMO_PROPERTIES;
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  fbSignOut,
  onAuthStateChanged
};
export type { User };
