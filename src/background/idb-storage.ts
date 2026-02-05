import { IDB_CONFIG } from '@shared/constants';

let dbInstance: IDBDatabase | null = null;

/**
 * Open IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_CONFIG.DB_NAME, IDB_CONFIG.VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(IDB_CONFIG.STORE_NAME)) {
        db.createObjectStore(IDB_CONFIG.STORE_NAME);
      }
    };
  });
}

/**
 * Save FileSystemDirectoryHandle to IndexedDB
 * CRITICAL: Only IndexedDB can persist FileSystemDirectoryHandle
 */
export async function saveDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IDB_CONFIG.STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IDB_CONFIG.STORE_NAME);

    const request = store.put(handle, 'directory-handle');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to save directory handle'));
  });
}

/**
 * Load FileSystemDirectoryHandle from IndexedDB
 */
export async function loadDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_CONFIG.STORE_NAME, 'readonly');
      const store = transaction.objectStore(IDB_CONFIG.STORE_NAME);

      const request = store.get('directory-handle');

      request.onsuccess = () => {
        const handle = request.result as FileSystemDirectoryHandle | undefined;
        resolve(handle || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to load directory handle'));
      };
    });
  } catch (error) {
    console.error('Error loading directory handle:', error);
    return null;
  }
}

/**
 * Verify that we still have permission to access the directory
 */
export async function verifyDirectoryPermission(
  handle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    // Type assertion for File System Access API methods not in TypeScript types
    const permission = await (handle as any).queryPermission({ mode: 'readwrite' });

    if (permission === 'granted') {
      return true;
    }

    // Try to request permission
    const requestResult = await (handle as any).requestPermission({ mode: 'readwrite' });
    return requestResult === 'granted';
  } catch (error) {
    console.error('Error verifying directory permission:', error);
    return false;
  }
}

/**
 * Clear all stored data
 */
export async function clearStorage(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IDB_CONFIG.STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IDB_CONFIG.STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear storage'));
  });
}
