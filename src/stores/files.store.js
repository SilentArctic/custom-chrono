import { defineStore } from 'pinia';
import { openDB } from 'idb';

const DB_NAME = 'custom-chrono';
const DB_VERSION = 1;

let _db = null;
let _loadPromise = null;

async function getDb() {
   if (_db) return _db;
   _db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
         if (!db.objectStoreNames.contains('folders')) {
            db.createObjectStore('folders', { keyPath: 'id' });
         }
         if (!db.objectStoreNames.contains('files')) {
            const store = db.createObjectStore('files', { keyPath: 'id' });
            store.createIndex('folderId', 'folderId');
         }
      },
   });
   return _db;
}

export const useFilesStore = defineStore('files', {
   state: () => ({ folders: [], files: [], loaded: false }),
   actions: {
      async load() {
         if (this.loaded) return;
         if (_loadPromise) return _loadPromise;
         _loadPromise = (async () => {
            const db = await getDb();
            this.folders = await db.getAll('folders');
            this.files = await db.getAll('files');
            this.loaded = true;
         })();
         return _loadPromise;
      },
      async createFolder(name) {
         const folder = { id: crypto.randomUUID(), name };
         const db = await getDb();
         await db.put('folders', folder);
         this.folders.push(folder);
      },
      async deleteFolder(id) {
         const db = await getDb();
         const tx = db.transaction(['folders', 'files'], 'readwrite');
         await tx.objectStore('folders').delete(id);
         const toDelete = await tx.objectStore('files').index('folderId').getAllKeys(id);
         await Promise.all(toDelete.map((k) => tx.objectStore('files').delete(k)));
         await tx.done;
         this.folders = this.folders.filter((f) => f.id !== id);
         this.files = this.files.filter((f) => f.folderId !== id);
      },
      async saveFile(name, params, folderId = null) {
         const file = { id: crypto.randomUUID(), name, folderId, params, savedAt: Date.now() };
         const db = await getDb();
         await db.put('files', file);
         this.files.push(file);
      },
      async deleteFile(id) {
         const db = await getDb();
         await db.delete('files', id);
         this.files = this.files.filter((f) => f.id !== id);
      },
   },
});
