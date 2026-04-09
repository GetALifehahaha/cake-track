import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const GlobalRefreshContext = createContext(null);

export const GlobalRefreshProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const [refreshSignal, setRefreshSignal] = useState(0);

    const triggerRefresh = useCallback(async (localRefresh) => {
        if (refreshing) return;

        setRefreshing(true);
        try {
            const tasks = [
                queryClient.invalidateQueries(),
            ];

            if (typeof localRefresh === 'function') {
                tasks.push(localRefresh());
            }

            await Promise.allSettled(tasks);
            setRefreshSignal((prev) => prev + 1);
        } finally {
            setRefreshing(false);
        }
    }, [queryClient, refreshing]);

    const value = useMemo(() => ({
        refreshing,
        refreshSignal,
        triggerRefresh,
    }), [refreshing, refreshSignal, triggerRefresh]);

    return (
        <GlobalRefreshContext.Provider value={value}>
            {children}
        </GlobalRefreshContext.Provider>
    );
};

export const useGlobalRefresh = () => {
    const context = useContext(GlobalRefreshContext);
    if (!context) {
        throw new Error('useGlobalRefresh must be used within a GlobalRefreshProvider');
    }
    return context;
};
