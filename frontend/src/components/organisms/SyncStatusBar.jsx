import React from 'react';
import { cn } from '@/utils/cn';

export const SyncStatusBar = ({
    isOnline,
    unsyncedCount,
    isSyncing,
    syncProgress,
    syncResult,
    onSync,
}) => {
    const syncDisabled = !isOnline || isSyncing || unsyncedCount === 0;

    return (
        <div className={cn('flex items-center justify-between flex-wrap gap-3 px-6 py-1 rounded-full border text-sm', isOnline ? 'bg-success-fill border-success-border' : 'text-red-500')}>

            {/* ── Status + pending badge ── */}
            <div className='flex items-center gap-2'>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-error'}`} />
                <span className={cn('font-medium text-text', isOnline ? 'text-success' : 'text-error')}>
                    {isOnline ? 'Online' : 'Offline'}
                </span>

                {unsyncedCount > 0 && (
                    <span className='bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full'>
                        {unsyncedCount} pending
                    </span>
                )}
            </div>

            {/* ── Feedback + button ── */}
            <div className='flex items-center gap-3'>

                {isSyncing && syncProgress && (
                    <span className='text-text/50 text-xs'>
                        Syncing {syncProgress.done}/{syncProgress.total}…
                    </span>
                )}

                {!isSyncing && syncResult && !syncResult.error && (
                    <span className={`text-xs font-medium ${syncResult.failed > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {syncResult.failed > 0
                            ? `✓ ${syncResult.success} synced · ✗ ${syncResult.failed} failed`
                            : `✓ ${syncResult.success} synced`}
                    </span>
                )}

                {!isSyncing && syncResult?.error && (
                    <span className='text-xs font-medium text-red-500'>
                        {syncResult.error}
                    </span>
                )}

                <button
                    onClick={onSync}
                    disabled={syncDisabled}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity
                        bg-accent text-white
                        ${syncDisabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:opacity-90'}`}
                >
                    {isSyncing ? 'Syncing…' : 'Sync Now'}
                </button>
            </div>
        </div>
    );
};

export default SyncStatusBar;