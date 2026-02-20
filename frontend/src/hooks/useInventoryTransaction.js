import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InventoryTransactionApi from "@/api/InventoryTransaction";

export default function useInventoryTransaction() {
    const queryClient = useQueryClient();
    const queryKey = ["inventory-transactions"];

    // 1. FETCH (Read)
    const { 
        data: inventoryTransactionData = [], 
        isLoading: isReading, 
        error: readError,
        refetch 
    } = useQuery({
        queryKey: queryKey,
        queryFn: () => InventoryTransactionApi(),
        // Optional: Keep data fresh for 1 minute, prevent immediate refetch on window focus
        staleTime: 1000 * 60, 
    });

    // 2. CREATE (Post)
    const createMutation = useMutation({
        mutationFn: (params) => InventoryTransactionApi(params, null, "POST"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
            queryClient.invalidateQueries({ queryKey: ['ingredient-fetch-all'] });
            queryClient.invalidateQueries({ queryKey: ['ingredient-dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
        }
    });

    // 3. UPDATE (Patch)
    // Note: mutations only accept one argument, so we wrap id and params in an object
    const updateMutation = useMutation({
        mutationFn: ({ id, params }) => InventoryTransactionApi(params, id, "PATCH"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    // 4. DELETE
    const deleteMutation = useMutation({
        mutationFn: (id) => InventoryTransactionApi(null, id, "DELETE"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    // Helper to consolidate loading states (if any operation is in progress)
    const inventoryTransactionLoading = isReading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    // Helper to consolidate errors
    const inventoryTransactionError = readError || createMutation.error || updateMutation.error || deleteMutation.error;

    // Helper to consolidate success responses
    // In RQ, we usually access this via mutation.data, but this mocks your old structure
    const inventoryTransactionResponse = createMutation.isSuccess 
        ? { status: "success", detail: "Inventory transaction created successfully." }
        : updateMutation.isSuccess 
        ? { status: "success", detail: "Inventory transaction updated successfully." }
        : deleteMutation.isSuccess
        ? { status: "success", detail: "Inventory transaction deleted successfully." }
        : null;

    return {
        // Data
        inventoryTransactionData,
        
        // Statuses
        inventoryTransactionLoading,
        inventoryTransactionError: inventoryTransactionError ? { status: "error", detail: inventoryTransactionError.message || "An error occurred" } : null,
        inventoryTransactionResponse,
        
        // Actions
        // We use mutateAsync to allow your UI to await the result if needed
        fetchInventoryTransactions: refetch,
        
        postInventoryTransaction: (params) => createMutation.mutateAsync(params),
        
        patchInventoryTransaction: (id, params) => updateMutation.mutateAsync({ id, params }),
        
        deleteInventoryTransaction: (id) => deleteMutation.mutateAsync(id),
        
        refresh: refetch
    };
}