import { useEffect, useState } from "react";
import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useBusinessDetails() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    const businessDetailsQuery = useQueryFetch(
        "business-details",
        isOnline ? API_ENDPOINTS.BUSINESS_DETAILS : null,
        {}
    );
    const { create, update, remove, loading: mutateLoading, error: mutateError } =
        useMutate("business-details");

    return {
        data: businessDetailsQuery.data || {},

        loading: isOnline ? (businessDetailsQuery.isPending || mutateLoading) : false,

        error: isOnline ? (businessDetailsQuery.error || mutateError) : mutateError,

        postBusinessDetails: (params) => create(API_ENDPOINTS.BUSINESS_DETAILS, params),

        patchBusinessDetails: (id, data) =>
            update(`${API_ENDPOINTS.BUSINESS_DETAILS}${id}/`, data),

        deleteBusinessDetails: (id) => remove(`${API_ENDPOINTS.BUSINESS_DETAILS}${id}/`),
    };
}
