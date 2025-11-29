import { useState, useEffect, useCallback, useMemo } from "react";
import OrderApi from "@/api/OrdersApi";
import { useLocation, useSearchParams } from "react-router-dom";

export default function useOrder() {
    // 1. Standardized state names
    const [data, setData] = useState([]);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    
    const currentParams = useMemo(() => 
        Object.fromEntries(searchParams.entries()), 
    [searchParams]);

    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastPart = pathSegments.pop();
    const currentFilter = lastPart === 'queue' ? null : lastPart;

    // Helper to parse backend errors
    const handleError = (err, defaultMsg) => {
        const msg = err.response?.data?.detail || err.response?.data || defaultMsg;
        setError({ status: "error", detail: msg });
        setResponse(null);
    };

    // 1. Define all possible candidates for parameters
    const rawParams = {
        status: currentFilter, // e.g., 'pending' or null
        created_at: currentParams.due_date, // e.g., '2025-11-29' or 'null'
        // Easy to add more later:
        // search: currentParams.search,
        // page: currentParams.page
    };

    const params = Object.entries(rawParams).reduce((acc, [key, value]) => {
    // The "Sanity Check": 
    // Is it truthy? AND is it not the string "null" or "undefined"?
    const isValid = value && value !== 'null' && value !== 'undefined';

    if (isValid) {
        acc[key] = value;
    }
    return acc;
    }, {});

    const fetchOrders = useCallback(async () => {
        
        setLoading(true);
        setError(null); 
        try {


            const result = await OrderApi(params);
            setData(result);
        } catch (err) {
            handleError(err, "Failed to read orders.");
        } finally {
            setLoading(false);
        }
    }, [currentFilter, currentParams]);

    // 3. Create Order
    const postOrder = async (params) => {
        setLoading(true);
        setError(null);
        try {
            // Removed 'all' argument
            await OrderApi(params, null, "POST");
            setResponse({ status: "success", detail: "Order created successfully." });
            await fetchOrders(); // Refresh list automatically
        } catch (err) {
            handleError(err, "Failed to create order.");
        } finally {
            setLoading(false);
        }
    };

    const batchUpdateOrders = async (params) => {
        setLoading(true);
        setError(null);

        try {
            await OrderApi(params, null, "BATCH_UPDATE");
            setResponse({status: "success", detail: "Orders updated successfully"});
            await fetchOrders();
        } catch (err) {
            handleError(err, "Failed to update orders.");
        } finally {
            setLoading(false);
        }
    }

    // 4. Update Order
    const patchOrder = async (id, params) => {
        setLoading(true);
        setError(null);
        try {
            // Removed 'all' argument
            await OrderApi(params, id, "PATCH");
            setResponse({ status: "success", detail: "Order updated successfully." });
            await fetchOrders();
        } catch (err) {
            handleError(err, "Failed to update order.");
        } finally {
            setLoading(false);
        }
    };

    // 5. Delete Order
    const deleteOrder = async (id) => {
        setLoading(true);
        setError(null);
        try {
            // Removed 'all' argument
            await OrderApi(null, id, "DELETE");
            setResponse({ status: "success", detail: "Order deleted successfully." });
            await fetchOrders();
        } catch (err) {
            handleError(err, "Failed to delete order.");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        // Data States
        data,
        response,
        loading,
        error,
        
        // Actions
        fetchOrders,
        postOrder,
        patchOrder,
        deleteOrder,
        refresh: fetchOrders,
        batchUpdateOrders
    };
}