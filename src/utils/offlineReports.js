import { api } from "../api/client.js";

const dbName = "tala-crisis-map";
const storeName = "offline-reports";
const dbVersion = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = callback(store);
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function saveOfflineReport(payload) {
  const item = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload
  };
  await withStore("readwrite", (store) => store.put(item));
  return item;
}

export async function listOfflineReports() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineReport(id) {
  await withStore("readwrite", (store) => store.delete(id));
}

export function buildReportFormData(payload) {
  const body = new FormData();
  Object.entries(payload.fields).forEach(([key, value]) => {
    body.append(key, value);
  });
  payload.images.forEach((image) => body.append("images", image));
  return body;
}

export async function syncOfflineReports({ authenticated = false } = {}) {
  const items = await listOfflineReports();
  const synced = [];
  const failed = [];

  for (const item of items) {
    try {
      const body = buildReportFormData({
        ...item.payload,
        fields: {
          ...item.payload.fields,
          offlineCreatedAt: item.payload.fields.offlineCreatedAt || item.createdAt,
          offlineSyncedAt: new Date().toISOString()
        }
      });
      await api(authenticated ? "/reports" : "/reports/guest", { method: "POST", body });
      await deleteOfflineReport(item.id);
      synced.push(item.id);
    } catch (error) {
      failed.push({ id: item.id, message: error.message });
    }
  }

  return { total: items.length, synced, failed };
}
