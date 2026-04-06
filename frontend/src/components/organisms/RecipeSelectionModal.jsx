import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/molecules/Modal';
import { Button } from '@/components/atoms';
import { Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecipeSelectionModal = ({
    options = [],
    selectedValue = null,
    onConfirm,
    onClose,
    onAddNewRecipe,
}) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [draftSelected, setDraftSelected] = useState(null);

    useEffect(() => {
        setDraftSelected(selectedValue);
    }, [selectedValue]);

    const filteredOptions = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) return options;
        return options.filter(({ key }) => String(key).toLowerCase().includes(needle));
    }, [options, search]);

    return (
        <Modal title="Select Recipe" onClose={onClose} className='w-[640px]'>
            <div className='flex flex-col gap-4'>
                <div className='relative'>
                    <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-text/50' />
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search recipe..."
                        className='w-full pl-10 pr-4 py-2 rounded-md border border-border bg-main-dark/25 focus:outline-none'
                    />
                </div>

                <div className='border border-border rounded-md max-h-[45vh] overflow-y-auto flex flex-col'>
                    <button
                        type='button'
                        onClick={() => {
                            if (onAddNewRecipe) {
                                onAddNewRecipe();
                            } else {
                                navigate('/recipes/create');
                            }
                        }}
                        className='w-full flex flex-row items-center justify-between px-4 py-4 border-b border-accent/10 hover:bg-main-dark/10 text-left bg-accent/5'
                    >
                        <h5 className='text-sm font-semibold text-accent'>+ New Recipe</h5>
                        <ChevronRight size={16} className='text-accent' />
                    </button>

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type='button'
                                onClick={() => {
                                    setDraftSelected(option.value);
                                    onConfirm(option.value);
                                    onClose();
                                }}
                                className={`w-full flex flex-col gap-1 px-4 py-3 border-b cursor-pointer last:border-b-0 border-accent/10 hover:bg-main-dark/5 text-left ${String(draftSelected) === String(option.value) ? 'bg-accent/10' : ''}`}
                            >
                                <h5 className={`text-sm font-medium ${String(draftSelected) === String(option.value) ? 'text-accent' : 'text-text'}`}>
                                    {option.key}
                                </h5>
                                {option.description && (
                                    <p className='text-xs text-text/60 line-clamp-1'>{option.description}</p>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className='px-4 py-8 text-center text-sm text-text/60'>No recipes found.</div>
                    )}
                </div>

                <div className='flex justify-end'>
                    <Button variant='modalOutline' text='Cancel' onClick={onClose} />
                </div>
            </div>
        </Modal>
    );
};

export default RecipeSelectionModal;