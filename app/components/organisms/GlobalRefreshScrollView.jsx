import React, { useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useGlobalRefresh } from '@/context/GlobalRefreshContext';

const GlobalRefreshScrollView = ({ children, onRefresh, refreshControl, ...props }) => {
    const { refreshing, triggerRefresh } = useGlobalRefresh();

    const handleRefresh = useCallback(async () => {
        await triggerRefresh(onRefresh);
    }, [triggerRefresh, onRefresh]);

    return (
        <ScrollView
            {...props}
            refreshControl={refreshControl || (
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#8B5A3C']}
                    tintColor="#8B5A3C"
                />
            )}
        >
            {children}
        </ScrollView>
    );
};

export default GlobalRefreshScrollView;
