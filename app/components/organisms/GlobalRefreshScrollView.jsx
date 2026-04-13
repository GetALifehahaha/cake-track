import React, { useCallback, forwardRef } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useGlobalRefresh } from '@/context/GlobalRefreshContext';

const GlobalRefreshScrollView = forwardRef(({ children, onRefresh, refreshControl, ...props }, ref) => {
    const { refreshing, triggerRefresh } = useGlobalRefresh();

    const handleRefresh = useCallback(async () => {
        await triggerRefresh(onRefresh);
    }, [triggerRefresh, onRefresh]);

    return (
        <ScrollView
            ref={ref}
            {...props}
            refreshControl={refreshControl || (
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#8B5A3C']}
                    tintColor='#8B5A3C'
                />
            )}
        >
            {children}
        </ScrollView>
    );
});

GlobalRefreshScrollView.displayName = 'GlobalRefreshScrollView';

export default GlobalRefreshScrollView;
