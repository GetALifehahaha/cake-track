import { getTransactions, markSynced, markSyncError } from "./db";
import api from "@/api/api";

export const syncTransactions = async ({ apiUrl, token, onProgress }) => {
    const unsynced = await getTransactions('unsynced');
    const total = unsynced.length;

    if (total === 0) return { success: 0, failed: 0, total: 0}

    let success = 0;
    let failed = 0;

    for (const record of unsynced) {
        const { local_id, synced, synced_at, server_id, sync_error, ...payload} = record;

        try {
            const response = await api.post(apiUrl, payload);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.text()}`)
            }

            const data = await response.json();

            await markSynced(local_id, data.id ?? data.pk ?? null);
            success++;
        } catch (err) {
            await markSyncError(local_id, err.message);
            failed++;
        }

        onProgress?.({done: success + failed, total, success, failed});
    }

    return { success, failed, total };
}