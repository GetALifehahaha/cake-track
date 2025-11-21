import { useState, useEffect } from "react";
import InventoryTransactionApi from "@/api/InventoryTransaction";

export default function useInventoryTransaction() {
    const [inventoryTransactionResponse, setInventoryTransactionResponse] = useState();
    const [inventoryTransactionData, setInventoryTransactionData] = useState([]);
    const [inventoryTransactionLoading, setInventoryTransactionLoading] = useState(true);
    const [inventoryTransactionError, setInventoryTransactionError] = useState(null);

    const fetchInventoryTransactions = async () => {
        setInventoryTransactionLoading(true);
        try {
            const data = await InventoryTransactionApi();
            setInventoryTransactionData(data);
        } catch (err) {
            setInventoryTransactionError({ status: "error", detail: "Failed to read inventory transactions." });
        } finally {
            setInventoryTransactionLoading(false);
        }
    };

    const postInventoryTransaction = async (params) => {
        setInventoryTransactionLoading(true);
        try {
            await InventoryTransactionApi(params, null, "POST");
            setInventoryTransactionResponse({ status: "success", detail: "Inventory transaction created successfully." });
            fetchInventoryTransactions();
        } catch (err) {
            setInventoryTransactionError({ status: "error", detail: "Failed to create inventory transaction." });
            setInventoryTransactionResponse(null);
        } finally {
            setInventoryTransactionLoading(false);
        }
    };

    const patchInventoryTransaction = async (id, params) => {
        setInventoryTransactionLoading(true);
        try {
            await InventoryTransactionApi(params, id, "PATCH");
            setInventoryTransactionResponse({ status: "success", detail: "Inventory transaction updated successfully." });
            fetchInventoryTransactions();
        } catch (err) {
            setInventoryTransactionError({ status: "error", detail: "Failed to update inventory transaction." });
            setInventoryTransactionResponse(null);
        } finally {
            setInventoryTransactionLoading(false);
        }
    };

    const deleteInventoryTransaction = async (id) => {
        setInventoryTransactionLoading(true);
        try {
            await InventoryTransactionApi(null, id, "DELETE");
            setInventoryTransactionResponse({ status: "success", detail: "Inventory transaction deleted successfully." });
            fetchInventoryTransactions();
        } catch (err) {
            setInventoryTransactionError({ status: "error", detail: "Failed to delete inventory transaction." });
            setInventoryTransactionResponse(null);
        } finally {
            setInventoryTransactionLoading(false);
        }
    };

    const refresh = () => fetchInventoryTransactions();

    useEffect(() => {
        fetchInventoryTransactions();
    }, []);

    return {
        inventoryTransactionData,
        inventoryTransactionResponse,
        inventoryTransactionLoading,
        inventoryTransactionError,
        fetchInventoryTransactions,
        postInventoryTransaction,
        patchInventoryTransaction,
        deleteInventoryTransaction,
        refresh
    };
}
