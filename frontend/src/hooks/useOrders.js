import { useState, useEffect, useCallback } from "react";
import OrderApi from "@/api/OrdersApi";

export default function useOrder() {
    // 1. Standardized state names
    const [data, setData] = useState([]);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to parse backend errors
    const handleError = (err, defaultMsg) => {
        const msg = err.response?.data?.detail || err.response?.data || defaultMsg;
        setError({ status: "error", detail: msg });
        setResponse(null);
    };

    // 2. Fetch Orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null); 
        try {
            // FIX: Removed 'all' argument. 
            // Signature assumed: (params, id, method)
            const result = await OrderApi();
            setData(result);
        } catch (err) {
            handleError(err, "Failed to read orders.");
        } finally {
            setLoading(false);
        }
    }, []);

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
        refresh: fetchOrders
    };
}