import React, { useMemo, useState } from 'react';
import { ModalBody, ModalErrorState, ModalFeedbackCard } from '../../molecules';
import { Button } from '../../atoms';
import useContainers from '@/hooks/useContainers';
import { CRUDModalSkeleton } from '@/components/molecules/Skeletons';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';

const createEmptyContainer = () => ({
    name: '',
    symbol: '',
});

const getApiErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;

    if (typeof payload?.detail === 'string') return payload.detail;
    if (Array.isArray(payload?.name) && payload.name[0]) return payload.name[0];
    if (Array.isArray(payload?.symbol) && payload.symbol[0]) return payload.symbol[0];
    if (typeof payload === 'string') return payload;

    return fallback;
};

const UnitModal = ({ onClose }) => {
    const {
        containerData,
        containerLoading,
        containerError,
        postContainer,
        patchContainer,
        deleteContainer,
        refresh,
    } = useContainers();

    const [draft, setDraft] = useState(createEmptyContainer());
    const [editingId, setEditingId] = useState(null);
    const [editingValues, setEditingValues] = useState(createEmptyContainer());
    const [feedback, setFeedback] = useState(null);
    const [busyAction, setBusyAction] = useState('');

    if (containerLoading) return <CRUDModalSkeleton title='Manage Containers' subtitle='Create and maintain reusable container labels.' onClose={onClose} />
    if (containerError) return <ModalErrorState onClose={onClose} onRetry={refresh} title='Failed to load containers' details='Unable to load containers right now. Please try reloading this modal.' />;

    const sortedContainers = useMemo(() => {
        return [...(containerData || [])].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }, [containerData]);

    const setDraftValue = (key, value) => {
        if (key === 'name' && value.length > 50) return;
        if (key === 'symbol' && value.length > 10) return;
        setDraft(prev => ({ ...prev, [key]: value }));
    };

    const setEditValue = (key, value) => {
        if (key === 'name' && value.length > 50) return;
        if (key === 'symbol' && value.length > 10) return;
        setEditingValues(prev => ({ ...prev, [key]: value }));
    };

    const startEdit = (container) => {
        setEditingId(container.id);
        setEditingValues({
            name: container.name || '',
            symbol: container.symbol || '',
        });
        setFeedback(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValues(createEmptyContainer());
    };

    const handleCreateContainer = async () => {
        const payload = {
            name: draft.name.trim(),
            symbol: draft.symbol.trim(),
        };

        if (!payload.name) {
            setFeedback({ type: 'error', label: 'Missing Name', details: 'Container name is required.' });
            return;
        }

        try {
            setBusyAction('create');
            await postContainer(payload);
            setDraft(createEmptyContainer());
            setFeedback({ type: 'success', label: 'Container Added', details: `${payload.name} is now available for ingredient mappings.` });
        } catch (error) {
            setFeedback({
                type: 'error',
                label: 'Create Failed',
                details: getApiErrorMessage(error, 'Unable to create container.'),
            });
        } finally {
            setBusyAction('');
        }
    };

    const handleSaveEdit = async () => {
        const payload = {
            name: editingValues.name.trim(),
            symbol: editingValues.symbol.trim(),
        };

        if (!payload.name || !editingId) {
            setFeedback({ type: 'error', label: 'Missing Name', details: 'Container name is required.' });
            return;
        }

        try {
            setBusyAction(`edit-${editingId}`);
            await patchContainer(editingId, payload);
            setFeedback({ type: 'success', label: 'Container Updated', details: `${payload.name} has been updated.` });
            cancelEdit();
        } catch (error) {
            setFeedback({
                type: 'error',
                label: 'Update Failed',
                details: getApiErrorMessage(error, 'Unable to update container.'),
            });
        } finally {
            setBusyAction('');
        }
    };

    const handleDelete = async (container) => {
        const approved = window.confirm(`Delete container "${container.name}"?`);
        if (!approved) return;

        try {
            setBusyAction(`delete-${container.id}`);
            await deleteContainer(container.id);
            setFeedback({ type: 'success', label: 'Container Deleted', details: `${container.name} has been removed.` });
            if (editingId === container.id) {
                cancelEdit();
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                label: 'Delete Failed',
                details: getApiErrorMessage(error, 'Unable to delete this container.'),
            });
        } finally {
            setBusyAction('');
        }
    };

    return (
        <ModalBody className='w-[70vw]' title='Manage Containers' subtitle='Create reusable labels like Bottle, Cup, or Piece for ingredient mappings.' onClose={onClose}>
            <div className='flex flex-col gap-4 w-full'>
                <div className='border border-border rounded-xl p-4 bg-main-white'>
                    <h5 className='text-sm font-semibold text-text mb-3'>Add Container</h5>
                    <div className='grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-2'>
                        <input
                            type='text'
                            value={draft.name}
                            onChange={(event) => setDraftValue('name', event.target.value)}
                            placeholder='Container name (e.g., Bottle)'
                            className='px-4 py-2 rounded-md bg-main border border-border focus:outline-none'
                        />
                        <input
                            type='text'
                            value={draft.symbol}
                            onChange={(event) => setDraftValue('symbol', event.target.value)}
                            placeholder='Symbol (optional)'
                            className='px-4 py-2 rounded-md bg-main border border-border focus:outline-none'
                        />
                        <Button
                            variant='modalBlock'
                            text='Add'
                            icon={Plus}
                            onClick={handleCreateContainer}
                            loading={busyAction === 'create'}
                        />
                    </div>
                </div>

                <div className='border border-border rounded-xl bg-main-white overflow-hidden'>
                    <div className='px-4 py-3 border-b border-border bg-main'>
                        <h5 className='text-sm font-semibold text-text'>Available Containers ({sortedContainers.length})</h5>
                    </div>

                    <div className='max-h-[42vh] overflow-y-auto'>
                        {sortedContainers.length === 0 && (
                            <div className='p-6 text-sm text-text/60 text-center'>No containers yet. Create one above to get started.</div>
                        )}

                        {sortedContainers.map((container) => {
                            const isEditing = editingId === container.id;
                            const isSaving = busyAction === `edit-${container.id}`;
                            const isDeleting = busyAction === `delete-${container.id}`;

                            return (
                                <div key={container.id} className='px-4 py-3 border-b border-border/70 last:border-b-0 flex flex-col gap-2'>
                                    {isEditing ? (
                                        <div className='grid grid-cols-1 md:grid-cols-[1fr_160px_auto_auto] gap-2'>
                                            <input
                                                type='text'
                                                value={editingValues.name}
                                                onChange={(event) => setEditValue('name', event.target.value)}
                                                className='px-3 py-2 rounded-md bg-main border border-border focus:outline-none'
                                            />
                                            <input
                                                type='text'
                                                value={editingValues.symbol}
                                                onChange={(event) => setEditValue('symbol', event.target.value)}
                                                className='px-3 py-2 rounded-md bg-main border border-border focus:outline-none'
                                            />
                                            <Button variant='modalBlock' text='Save' icon={Check} onClick={handleSaveEdit} loading={isSaving} />
                                            <Button variant='modalOutline' text='Cancel' icon={X} onClick={cancelEdit} disabled={isSaving} />
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-3'>
                                            <div className='flex-1'>
                                                <h6 className='font-medium text-text'>{container.name}</h6>
                                                <p className='text-xs text-text/60'>{container.symbol || 'No symbol set'}</p>
                                            </div>

                                            <Button variant='modalOutline' text='Edit' icon={Pencil} onClick={() => startEdit(container)} disabled={!!busyAction} />
                                            <Button variant='error' text='Delete' icon={Trash2} onClick={() => handleDelete(container)} disabled={!!busyAction} loading={isDeleting} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {feedback && (
                    <ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
                )}
            </div>

            <div className='flex justify-end mt-4'>
                <Button text='Close' variant='modalOutline' onClick={onClose} />
            </div>
        </ModalBody>
    );
};

export default UnitModal;