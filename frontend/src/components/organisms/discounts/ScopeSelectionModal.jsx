import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/molecules/Modal';
import { Button } from '@/components/atoms';
import { Check, Search } from 'lucide-react';

const ScopeSelectionModal = ({
    title,
    options = [],
    selectedValues = [],
    itemLabel = 'items',
    onConfirm,
    onClose,
}) => {
    const [search, setSearch] = useState('');
    const [draftSelected, setDraftSelected] = useState([]);

    useEffect(() => {
        setDraftSelected(selectedValues);
    }, [selectedValues]);

    const filteredOptions = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) return options;
        return options.filter(({ key }) => String(key).toLowerCase().includes(needle));
    }, [options, search]);

    const toggleValue = (value) => {
        setDraftSelected((prev) => (
            prev.some((selected) => String(selected) === String(value))
                ? prev.filter((selected) => String(selected) !== String(value))
                : [...prev, value]
        ));
    };

    const isChecked = (value) => draftSelected.some((selected) => String(selected) === String(value));

    return (
        <Modal title={title} onClose={onClose} className='w-[640px]'>
            <div className='flex flex-col gap-4'>
                <div className='relative'>
                    <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-text/50' />
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${itemLabel}...`}
                        className='w-full pl-10 pr-4 py-2 rounded-md border border-border bg-main-white focus:outline-none'
                    />
                </div>

                <div className='border border-border rounded-md max-h-[45vh] overflow-y-auto'>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type='button'
                                onClick={() => toggleValue(option.value)}
                                className='w-full flex items-center gap-3 px-3 py-2 border-b last:border-b-0 border-main-dark/10 hover:bg-main-dark/5 text-left'
                            >
                                <div className={`w-5 h-5 rounded-sm border flex items-center justify-center ${isChecked(option.value) ? 'bg-accent border-accent text-white' : 'border-border text-transparent'}`}>
                                    <Check size={12} />
                                </div>
                                <h5 className='text-sm font-medium text-text'>{option.key}</h5>
                            </button>
                        ))
                    ) : (
                        <div className='px-4 py-8 text-center text-sm text-text/60'>No {itemLabel} found.</div>
                    )}
                </div>

                <div className='flex items-center justify-between'>
                    <h5 className='text-sm text-text/70 font-medium'>{draftSelected.length} selected</h5>
                    <div className='flex gap-2'>
                        <Button variant='modalOutline' text='Cancel' onClick={onClose} />
                        <Button variant='modalBlock' text='Confirm' onClick={() => onConfirm(draftSelected)} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ScopeSelectionModal;
