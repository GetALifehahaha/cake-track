import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CashierApi from "@/api/CashierApi";

export default function useCashier() {
    const queryClient = useQueryClient();
    // We scope this key specifically to 'cashiers' so it doesn't conflict with other user lists
    const queryKey = ["cashiers"];

    // 1. FETCH (Read)
    const { 
        data: cashierData = [], 
        isLoading: isReading, 
        error: readError,
        refetch 
    } = useQuery({
        queryKey: queryKey,
        // We explicitly pass the group filter here
        queryFn: () => CashierApi(),
        staleTime: 1000 * 60, 
    });

    // 2. CREATE (Post)
    const createMutation = useMutation({
        mutationFn: (params) => CashierApi(params, null, "POST"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    // 3. UPDATE (Patch)
    const updateMutation = useMutation({
        mutationFn: ({ id, params }) => CashierApi(params, id, "PATCH"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    // 4. DELETE
    const deleteMutation = useMutation({
        mutationFn: (id) => CashierApi(null, id, "DELETE"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    // Helper to consolidate loading states
    const cashierLoading = isReading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    // Helper to consolidate errors
    const cashierError = readError || createMutation.error || updateMutation.error || deleteMutation.error;

    // Helper to consolidate success responses
    const cashierResponse = createMutation.isSuccess 
        ? { status: "success", detail: "Cashier account created successfully." }
        : updateMutation.isSuccess 
        ? { status: "success", detail: "Cashier account updated successfully." }
        : deleteMutation.isSuccess
        ? { status: "success", detail: "Cashier account deleted successfully." }
        : null;

    return {
        // Data
        cashierData,
        
        // Statuses
        cashierLoading,
        cashierError: cashierError ? { status: "error", detail: cashierError.message || "An error occurred" } : null,
        cashierResponse,
        
        // Actions
        fetchCashiers: refetch,
        postCashier: (params) => createMutation.mutateAsync(params),
        patchCashier: (id, params) => updateMutation.mutateAsync({ id, params }),
        deleteCashier: (id) => deleteMutation.mutateAsync(id),
        refresh: refetch
    };
}