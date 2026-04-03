/**
 * IndexedDB wrapper for secure key storage.
 * Stores encrypted private keys and session data.
 * Vault keys are never persisted — they are always derived on-the-fly.
 *
 * DB_VERSION 2: vault_keys store removed.
 */

const DB_NAME = 'password-manager-db';
const DB_VERSION = 2; // v2: vault_keys store removed

const STORES = {
  USER_KEYS: 'user_keys',
  SESSION_DATA: 'session_data',
} as const;

export interface UserKeyData {
  id: string; // Always '1' — single user per browser
  userId: string;
  encryptedPrivateKey: string;
  encryptedSeedPhrase: string;
  publicKey: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionData {
  key: string;
  value: string;
  expiresAt?: number; // Unix timestamp ms
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.USER_KEYS)) {
          const store = db.createObjectStore(STORES.USER_KEYS, {
            keyPath: 'id',
          });
          store.createIndex('userId', 'userId', { unique: true });
        }

        // v1 → v2 migration: drop legacy vault_keys store
        if (db.objectStoreNames.contains('vault_keys')) {
          db.deleteObjectStore('vault_keys');
        }

        if (!db.objectStoreNames.contains(STORES.SESSION_DATA)) {
          db.createObjectStore(STORES.SESSION_DATA, { keyPath: 'key' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initPromise;
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  private async dbGet<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () =>
        reject(new Error(`Failed to get item from ${storeName}`));
    });
  }

  private async dbPut<T>(storeName: string, value: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to put item in ${storeName}`));
    });
  }

  private async dbDelete(storeName: string, key: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to delete item from ${storeName}`));
    });
  }

  private async dbClear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to clear ${storeName}`));
    });
  }

  // ── User Keys ──────────────────────────────────────────────────────────────

  async saveUserKeys(data: UserKeyData): Promise<void> {
    return this.dbPut(STORES.USER_KEYS, data);
  }

  async getUserKeys(): Promise<UserKeyData | null> {
    return this.dbGet<UserKeyData>(STORES.USER_KEYS, '1');
  }

  async deleteUserKeys(): Promise<void> {
    return this.dbDelete(STORES.USER_KEYS, '1');
  }

  // ── Session Data ───────────────────────────────────────────────────────────

  async saveSessionData(
    key: string,
    value: string,
    expiresAt?: number,
  ): Promise<void> {
    return this.dbPut<SessionData>(STORES.SESSION_DATA, {
      key,
      value,
      expiresAt,
    });
  }

  async getSessionData(key: string): Promise<string | null> {
    const data = await this.dbGet<SessionData>(STORES.SESSION_DATA, key);
    if (!data) return null;

    if (data.expiresAt && Date.now() > data.expiresAt) {
      await this.deleteSessionData(key).catch(() => {
        // Silent cleanup failure
      });
      return null;
    }

    return data.value;
  }

  async deleteSessionData(key: string): Promise<void> {
    return this.dbDelete(STORES.SESSION_DATA, key);
  }

  async clearSessionData(): Promise<void> {
    return this.dbClear(STORES.SESSION_DATA);
  }

  // ── Bulk ───────────────────────────────────────────────────────────────────

  async clearAllData(): Promise<void> {
    await Promise.all([this.deleteUserKeys(), this.clearSessionData()]);
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const indexedDBService = new IndexedDBService();
