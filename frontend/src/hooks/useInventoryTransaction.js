import API_ENDPOINTS from "@/api/endpoints";
import useMutate from "./useMutate";
import useQueryFetch from "./useQueryFetch";

export default function useInventoryTransaction() {
    const inventoryTransactionQuery = useQueryFetch(
        "inventory-transactions",
        API_ENDPOINTS.INVENTORY_TRANSACTIONS,
    );
    const { create, update, remove, loading: mutateLoading, error: mutateError, response } =
        useMutate("inventory-transactions", {
            invalidateKeys: [
                ["ingredients"],
                ["ingredient-fetch-all"],
                ["ingredient-dashboard"],
                ["inventory-transactions"],
            ],
        });

    const inventoryTransactionLoading = inventoryTransactionQuery.isPending || mutateLoading;
    const rawError = inventoryTransactionQuery.error || mutateError;
    const inventoryTransactionError = rawError
        ? { status: "error", detail: rawError.message || "An error occurred" }
        : null;
    const inventoryTransactionResponse = response || null;

    return {
        inventoryTransactionData: inventoryTransactionQuery.data || [],
        inventoryTransactionLoading,
        inventoryTransactionError,
        inventoryTransactionResponse,

        fetchInventoryTransactions: () => inventoryTransactionQuery.refetch(),
        postInventoryTransaction: (params) => create(API_ENDPOINTS.INVENTORY_TRANSACTIONS, params),
        patchInventoryTransaction: (id, params) =>
            update(`${API_ENDPOINTS.INVENTORY_TRANSACTIONS}${id}/`, params),
        deleteInventoryTransaction: (id) => remove(`${API_ENDPOINTS.INVENTORY_TRANSACTIONS}${id}/`),
        refresh: () => inventoryTransactionQuery.refetch(),
    };
}