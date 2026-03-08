const DB_NAME = 'cake-track-db';
const DB_VERSION = 1;
const STORE_TRANSACTIONS = 'transactions';

let dbInstance = null;

export const openDB = () => {
    if (dbInstance) return Promise.resolve(dbInstance);

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
                const store = db.createObjectStore(STORE_TRANSACTIONS, {keypath: 'local_id', autoIncrement: true});

                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('created_at', 'created_at', { unique: false });
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
            putReq.onerror = () => reject(putReqerror);
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
            putReq.onerror = () => reject(putReqerror);
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