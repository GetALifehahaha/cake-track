import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";

const useMutate = (key, options = {}) => {
    const queryClient = useQueryClient();
    const { invalidateKeys = [] } = options;

    const normalizedInvalidateKeys = (invalidateKeys.length ? invalidateKeys : [key]).map(
        (queryKey) => (Array.isArray(queryKey) ? queryKey : [queryKey]),
    );

    const invalidate = async () => {
        await Promise.all(
            normalizedInvalidateKeys.map((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            ),
        );
    };

    const createMutation = useMutation({
        mutationFn: ({ url, data, config }) =>
            api.post(url, data, config).then((res) => res.data),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ url, data, config }) =>
            api.patch(url, data, config).then((res) => res.data),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: ({ url, config }) => api.delete(url, config).then((res) => res.data),
        onSuccess: invalidate,
    });

    const requestMutation = useMutation({
        mutationFn: ({ method, url, data, config }) =>
            api({ method, url, data, ...(config || {}) }).then((res) => res.data),
        onSuccess: invalidate,
    });

    return {
        create: (url, data, config) => createMutation.mutateAsync({ url, data, config }),
        update: (url, data, config) => updateMutation.mutateAsync({ url, data, config }),
        remove: (url, config) => deleteMutation.mutateAsync({ url, config }),
        request: (method, url, data, config) =>
            requestMutation.mutateAsync({ method, url, data, config }),

        loading:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending ||
            requestMutation.isPending,

        error:
            createMutation.error ||
            updateMutation.error ||
            deleteMutation.error ||
            requestMutation.error,

        response:
            createMutation.data ||
            updateMutation.data ||
            deleteMutation.data ||
            requestMutation.data,
    };
};

export default useMutate;