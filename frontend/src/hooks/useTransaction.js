import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";
import { saveTransaction, getTransactions, markSynced, markSyncError, countUnsynced } from "@/services/db";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";

export default function useTransaction() {
    const [searchParams] = useSearchParams();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { user } = useAuth();

    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);

        return () => {
            window.removeEventListener("online", on);
            window.removeEventListener("offline", off);
        };
    }, []);

    const apiParams = useMemo(() => {
        return Object.fromEntries(searchParams.entries());
    }, [searchParams]);

    const transactionQuery = useQueryFetch(
        ["transactions", user?.id ?? "guest"],
        isOnline ? API_ENDPOINTS.TRANSACTIONS : null,
        apiParams,
        { keepPreviousData: false }
    );
    const { create, update, remove, loading: mutateLoading, error: mutateError } =
        useMutate(["transactions", user?.id ?? "guest"]);

    const [unsyncedCount, setUnsyncedCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [syncProgress, setSyncProgress] = useState(null);

    useEffect(() => {
        refreshUnsyncedCount();
        const handleOnline = () => refreshUnsyncedCount();
        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, []);

    const refreshUnsyncedCount = async () => {
        const count = await countUnsynced();
        setUnsyncedCount(count);
    };

    const postTransaction = async (params) => {
        if (navigator.onLine) {
            try {
                const data = await create(API_ENDPOINTS.TRANSACTIONS, params);
                return { source: "server", data };
            } catch (err) {
                // Catch network timeouts or disconnects explicitly
                const isNetworkError = err.message === "Network Error" || err.code === "ERR_NETWORK" || !err.response;
                
                if (!isNetworkError) {
                    throw err; 
                }
            }
        }

        // Fallback to local storage if offline or if a network error occurs
        const local_id = await saveTransaction(params);
        await refreshUnsyncedCount();
        return { source: "local", local_id };
    };

    const syncOfflineTransactions = async () => {
        if (isSyncing || !navigator.onLine) return;

        setIsSyncing(true);
        setSyncResult(null);
        setSyncProgress(null);

        const unsynced = await getTransactions("unsynced");

        console.log(unsynced)
        const total = unsynced.length;
        let success = 0;
        let failed = 0;

        for (const record of unsynced) {
            const { local_id, synced, synced_at, server_id, sync_error, created_at, ...payload } = record;

            try {
                const response = await api.post(API_ENDPOINTS.TRANSACTIONS, payload);
                await markSynced(local_id, response.data.id ?? response.data.pk);
                success++;
            } catch (err) {
                await markSyncError(local_id, err.message);
                failed++;
            }

            setSyncProgress({ done: success + failed, total, success, failed });
        }

        await transactionQuery.refetch();
        setSyncResult({ success, failed, total });
        await refreshUnsyncedCount();
        setIsSyncing(false);
    };

    return {
        data: transactionQuery?.data || [],
        loading: isOnline ? (transactionQuery.isPending || mutateLoading) : mutateLoading,
        error: isOnline ? (transactionQuery.error || mutateError) : mutateError,

        postTransaction,
        patchTransaction: (id, data) => update(`${API_ENDPOINTS.TRANSACTIONS}${id}/`, data),
        deleteTransaction: (id) => remove(`${API_ENDPOINTS.TRANSACTIONS}${id}/`),
        refresh: () => transactionQuery.refetch(),

        unsyncedCount,
        isSyncing,
        syncProgress,
        syncResult,
        syncOfflineTransactions,
    };
}