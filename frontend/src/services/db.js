const DB_NAME = 'cake-track-db';
const DB_VERSION = 4;
const STORE_TRANSACTIONS = 'transactions';
const STORE_PRODUCTS = 'products'; // Add this line

let dbInstance = null;

export const openDB = () => {
    if (dbInstance) return Promise.resolve(dbInstance);

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
                const store = db.createObjectStore(STORE_TRANSACTIONS, {keyPath: 'local_id', autoIncrement: true});
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('created_at', 'created_at', { unique: false });
            }

            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('discounts')) {
                db.createObjectStore('discounts', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('business_settings')) {
                db.createObjectStore('business_settings', { keyPath: 'id' });
            }
        }

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        }

        request.onerror = (event) => {
            reject(event.target.error);
        }
    })   
};

export const saveTransaction = async (transactions) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_TRANSACTIONS, 'readwrite');
        const store = transaction.objectStore(STORE_TRANSACTIONS)

        const plain = JSON.parse(JSON.stringify(transactions));

        const record = {
            ...plain,
            synced: false,
            created_at: new Date().toISOString(),
            synced_at: null,
            server_id: null,
            sync_error: null,
        }

        const req = store.add(record);

        req.onsuccess = () => resolve(req.result);
        req.onerror = (event) => reject(event.target.error);
    })
}

export const getTransactions = async (filter = 'all') => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_TRANSACTIONS, 'readonly');
        const store = transaction.objectStore(STORE_TRANSACTIONS);

        let req;

        if (filter === 'unsynced' || filter === 'synced') {
            req = store.getAll();
        } else {
            req = store.getAll();
        }


        req.onsuccess = () => {
            if (filter === 'unsynced') {
                resolve(req.result.filter((item) => item.synced === false));
                return;
            }

            if (filter === 'synced') {
                resolve(req.result.filter((item) => item.synced === true));
                return;
            }

            resolve(req.result);
        };
        req.onerror = (event) => reject(event.target.error);
    });
}


export const markSynced = async (local_id, server_id) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_TRANSACTIONS, 'readwrite');
        const store = transaction.objectStore(STORE_TRANSACTIONS);

        const getReq = store.get(local_id);
        
        getReq.onsuccess = () => {
            const record = getReq.result;

            if (!record) return reject(new Error(`Record ${local_id} not found...`));

            record.synced = true;
            record.synced_at = new Date().toISOString();
            record.server_id = server_id;
            record.sync_error = null;

            const putReq = store.put(record);

            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        }
        getReq.onerror = (event) => reject(event.target.error);
    });
};

/** Mark a transaction as sync error */
export const markSyncError = async (local_id, error) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_TRANSACTIONS, 'readwrite');
        const store = transaction.objectStore(STORE_TRANSACTIONS);

        const getReq = store.get(local_id);
        
        getReq.onsuccess = () => {
            const record = getReq.result;

            if (!record) return reject(new Error(`Record ${local_id} not found...`));

            record.sync_error = error;

            const putReq = store.put(record);

            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        }
        getReq.onerror = (event) => reject(event.target.error);
    });
};

/** Count unsynced transactions */
export const countUnsynced = async () => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_TRANSACTIONS, 'readonly');
        const store = transaction.objectStore(STORE_TRANSACTIONS);
        
        const req = store.getAll();

        req.onsuccess = () => {
            const unsyncedCount = req.result.filter((item) => item.synced === false).length;
            resolve(unsyncedCount);
        };
        req.onerror = () => reject(req.error);
    })
}

export const saveAllProducts = async (products) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
        const store = transaction.objectStore(STORE_PRODUCTS);
        
        // Clear existing products to prevent stale data
        store.clear().onsuccess = () => {
            products.forEach(product => store.put(product));
        };
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
};

export const getLocalProducts = async ({ page = 1, limit = 10, category, q, isArchived = false } = {}) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_PRODUCTS, 'readonly');
        const store = transaction.objectStore(STORE_PRODUCTS);
        const request = store.getAll();

        request.onsuccess = () => {
            let results = request.result;

            // Filter by archived status
            results = results.filter(p => !!p.is_archived === isArchived);

            if (category) {
                results = results.filter(p =>
                    Array.isArray(p.categories) &&
                    p.categories.some(c => c.name === category)
                );
            }

            if (q) {
                const queryStr = q.toLowerCase();
                results = results.filter(p => p.name.toLowerCase().includes(queryStr));
            }

            // Local Pagination logic
            const totalCount = results.length;
            const startIndex = (page - 1) * limit;
            const paginatedResults = results.slice(startIndex, startIndex + limit);

            resolve({
                count: totalCount,
                next: startIndex + limit < totalCount ? `?page=${page + 1}` : null,
                previous: page > 1 ? `?page=${page - 1}` : null,
                results: paginatedResults
            });
        };
        request.onerror = (event) => reject(event.target.error);
    });
};

export const saveAllCategories = async (categories) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('categories', 'readwrite');
        const store = transaction.objectStore('categories');
        store.clear().onsuccess = () => {
            categories.forEach(category => store.put(category));
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
};

export const getLocalCategories = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('categories', 'readonly');
        const store = transaction.objectStore('categories');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const saveAllDiscounts = async (discounts) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('discounts', 'readwrite');
        const store = transaction.objectStore('discounts');
        store.clear().onsuccess = () => {
            discounts.forEach(discount => store.put(discount));
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
};

export const getLocalDiscounts = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('discounts', 'readonly');
        const store = transaction.objectStore('discounts');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// --- Business Settings (singleton, id=1) ---

const hashPin = async (pin) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(String(pin));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const saveBusinessSettings = async (settings) => {
    const db = await openDB();
    const hashed = await hashPin(settings.secret_pin);
    const record = { ...settings, id: 1, secret_pin_hash: hashed };
    delete record.secret_pin; // never store plaintext pin

    return new Promise((resolve, reject) => {
        const transaction = db.transaction('business_settings', 'readwrite');
        const store = transaction.objectStore('business_settings');
        store.put(record);
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
};

export const getLocalBusinessSettings = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('business_settings', 'readonly');
        const store = transaction.objectStore('business_settings');
        const request = store.get(1);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const verifyPinOffline = async (inputPin) => {
    const settings = await getLocalBusinessSettings();
    if (!settings || !settings.secret_pin_hash) return false;
    const inputHash = await hashPin(inputPin);
    return inputHash === settings.secret_pin_hash;
};