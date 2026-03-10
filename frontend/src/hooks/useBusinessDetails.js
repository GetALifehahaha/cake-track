import { useEffect, useState } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";
import { saveBusinessSettings, getLocalBusinessSettings, verifyPinOffline } from "@/services/db";

export default function useBusinessDetails() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineData, setOfflineData] = useState(null);
    const [offlineLoading, setOfflineLoading] = useState(!navigator.onLine);

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

    // Load from IDB when offline
    useEffect(() => {
        if (!isOnline) {
            setOfflineLoading(true);
            getLocalBusinessSettings()
                .then((data) => setOfflineData(data))
                .catch(() => setOfflineData(null))
                .finally(() => setOfflineLoading(false));
        }
    }, [isOnline]);

    const businessDetailsQuery = useQueryFetch(
        "business-details",
        isOnline ? API_ENDPOINTS.BUSINESS_DETAILS : null,
        {}
    );

    // Save to IDB whenever we get fresh data from the server
    useEffect(() => {
        if (isOnline && businessDetailsQuery.data && !businessDetailsQuery.isPending) {
            saveBusinessSettings(businessDetailsQuery.data).catch(console.error);
        }
    }, [isOnline, businessDetailsQuery.data, businessDetailsQuery.isPending]);

    const { create, update, remove, loading: mutateLoading, error: mutateError } =
        useMutate("business-details");

    const resolvedData = isOnline ? businessDetailsQuery.data : offlineData;

    return {
        data: resolvedData || {},

        loading: isOnline ? (businessDetailsQuery.isPending || mutateLoading) : offlineLoading,

        error: isOnline ? (businessDetailsQuery.error || mutateError) : mutateError,

        postBusinessDetails: (params) => create(API_ENDPOINTS.BUSINESS_DETAILS, params),

        patchBusinessDetails: (id, data) =>
            update(`${API_ENDPOINTS.BUSINESS_DETAILS}${id}/`, data),

        deleteBusinessDetails: (id) => remove(`${API_ENDPOINTS.BUSINESS_DETAILS}${id}/`),

        verifyPinOffline,
    };
}
