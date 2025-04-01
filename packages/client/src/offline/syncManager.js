import { API, Auth } from 'aws-amplify';
import { v4 as uuidv4 } from 'uuid';
import { openDB } from 'idb';

// IndexedDB database name and version
const DB_NAME = 'ConstructionTrackerOfflineDB';
const DB_VERSION = 1;

// Operations that can be performed offline
const OPERATION_TYPES = {
  CREATE_MATERIAL: 'CREATE_MATERIAL',
  UPDATE_MATERIAL_STATUS: 'UPDATE_MATERIAL_STATUS',
  CREATE_MATERIAL_HISTORY: 'CREATE_MATERIAL_HISTORY',
};

// Initialize the IndexedDB database
async function initDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store for pending operations
      if (!db.objectStoreNames.contains('pendingOperations')) {
        const pendingStore = db.createObjectStore('pendingOperations', { 
          keyPath: 'id' 
        });
        pendingStore.createIndex('timestamp', 'timestamp');
      }
      
      // Create a store for cached materials
      if (!db.objectStoreNames.contains('materials')) {
        const materialsStore = db.createObjectStore('materials', { 
          keyPath: 'id' 
        });
        materialsStore.createIndex('jobId', 'jobId');
        materialsStore.createIndex('qrCodeData', 'qrCodeData');
      }
      
      // Create a store for cached jobs
      if (!db.objectStoreNames.contains('jobs')) {
        db.createObjectStore('jobs', { keyPath: 'id' });
      }
    },
  });
}

// Queue an operation to be performed when online
async function queueOperation(operationType, data) {
  const db = await initDatabase();
  const operation = {
    id: uuidv4(),
    operationType,
    data,
    timestamp: new Date().toISOString(),
    status: 'pending',
    attempts: 0
  };
  
  await db.add('pendingOperations', operation);
  return operation.id;
}

// Process all pending operations when online
async function syncPendingOperations() {
  const db = await initDatabase();
  const tx = db.transaction('pendingOperations', 'readwrite');
  const pendingOps = await tx.store.index('timestamp').getAll();
  
  if (pendingOps.length === 0) {
    return { success: true, processed: 0 };
  }
  
  let processed = 0;
  let failed = 0;
  
  for (const op of pendingOps) {
    try {
      // Skip operations that have been processed
      if (op.status === 'completed') {
        continue;
      }
      
      // Increment attempt count
      op.attempts += 1;
      
      // Execute the operation based on its type
      switch (op.operationType) {
        case OPERATION_TYPES.CREATE_MATERIAL:
          await processCreateMaterial(op.data);
          break;
        case OPERATION_TYPES.UPDATE_MATERIAL_STATUS:
          await processUpdateMaterialStatus(op.data);
          break;
        case OPERATION_TYPES.CREATE_MATERIAL_HISTORY:
          await processCreateMaterialHistory(op.data);
          break;
        default:
          console.warn(`Unknown operation type: ${op.operationType}`);
          continue;
      }
      
      // Mark as completed
      op.status = 'completed';
      await tx.store.put(op);
      processed++;
    } catch (error) {
      console.error(`Failed to process operation ${op.id}:`, error);
      
      // Mark as failed after 3 attempts
      if (op.attempts >= 3) {
        op.status = 'failed';
        op.error = error.message || 'Unknown error';
      }
      
      await tx.store.put(op);
      failed++;
    }
  }
  
  await tx.done;
  
  // Clean up completed operations older than 7 days
  await cleanupCompletedOperations();
  
  return { 
    success: true, 
    processed,
    failed,
    pending: pendingOps.length - processed - failed
  };
}

// Cleanup completed operations older than 7 days
async function cleanupCompletedOperations() {
  const db = await initDatabase();
  const tx = db.transaction('pendingOperations', 'readwrite');
  const pendingOps = await tx.store.getAll();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  for (const op of pendingOps) {
    if (
      op.status === 'completed' && 
      new Date(op.timestamp) < sevenDaysAgo
    ) {
      await tx.store.delete(op.id);
    }
  }
  
  await tx.done;
}

// Process a CREATE_MATERIAL operation
async function processCreateMaterial(data) {
  const { mutation, variables } = data;
  await API.graphql({
    query: mutation,
    variables
  });
}

// Process an UPDATE_MATERIAL_STATUS operation
async function processUpdateMaterialStatus(data) {
  const { mutation, variables } = data;
  await API.graphql({
    query: mutation,
    variables
  });
}

// Process a CREATE_MATERIAL_HISTORY operation
async function processCreateMaterialHistory(data) {
  const { mutation, variables } = data;
  await API.graphql({
    query: mutation,
    variables
  });
}

// Save material to local cache
async function cacheMaterial(material) {
  const db = await initDatabase();
  await db.put('materials', material);
}

// Get material from local cache by ID
async function getCachedMaterial(id) {
  const db = await initDatabase();
  return db.get('materials', id);
}

// Get material from local cache by QR code
async function getCachedMaterialByQrCode(qrCodeData) {
  const db = await initDatabase();
  const tx = db.transaction('materials', 'readonly');
  const index = tx.store.index('qrCodeData');
  const materials = await index.getAll(qrCodeData);
  await tx.done;
  return materials[0] || null;
}

// Save job to local cache
async function cacheJob(job) {
  const db = await initDatabase();
  await db.put('jobs', job);
}

// Get job from local cache
async function getCachedJob(id) {
  const db = await initDatabase();
  return db.get('jobs', id);
}

// Get all materials for a job from local cache
async function getCachedMaterialsByJob(jobId) {
  const db = await initDatabase();
  const tx = db.transaction('materials', 'readonly');
  const index = tx.store.index('jobId');
  const materials = await index.getAll(jobId);
  await tx.done;
  return materials;
}

// Get all cached jobs
async function getAllCachedJobs() {
  const db = await initDatabase();
  return db.getAll('jobs');
}

// Check if we have internet connection
function isOnline() {
  return navigator.onLine;
}

// Add event listeners for online/offline events
function setupNetworkListeners(onlineCallback, offlineCallback) {
  window.addEventListener('online', () => {
    if (typeof onlineCallback === 'function') {
      onlineCallback();
    }
    syncPendingOperations().catch(console.error);
  });
  
  window.addEventListener('offline', () => {
    if (typeof offlineCallback === 'function') {
      offlineCallback();
    }
  });
}

// Initialize sync manager
function init() {
  setupNetworkListeners();
  
  // If we're online at startup, try to sync any pending operations
  if (isOnline()) {
    syncPendingOperations().catch(console.error);
  }
}

export {
  initDatabase,
  queueOperation,
  syncPendingOperations,
  cacheMaterial,
  getCachedMaterial,
  getCachedMaterialByQrCode,
  cacheJob,
  getCachedJob,
  getCachedMaterialsByJob,
  getAllCachedJobs,
  isOnline,
  setupNetworkListeners,
  init,
  OPERATION_TYPES
}; 