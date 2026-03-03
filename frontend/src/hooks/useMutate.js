import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";

const useMutate = (key) => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: [key] });

    const createMutation = useMutation({
        mutationFn: ({ url, data }) => api.post(url, data).then(res => res.data),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ url, data }) => api.patch(url, data).then(res => res.data),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: ({ url }) => api.delete(url).then(res => res.data),
        onSuccess: invalidate,
    });

    return {
        create: (url, data) => createMutation.mutateAsync({ url, data }),
        update: (url, data) => updateMutation.mutateAsync({ url, data }),
        remove: (url) => deleteMutation.mutateAsync({ url }),

        loading:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,

        error:
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error,
    };
};

export default useMutate;