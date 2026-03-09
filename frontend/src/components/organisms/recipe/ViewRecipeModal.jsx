import React from 'react';
import { Button } from '../../atoms';
import { X, UtensilsCrossed } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import { useState } from 'react';
import { ModalBody } from '@/components/molecules';
import { cn } from '@/utils/cn';

const ViewRecipeModal = ({ recipe, onClose, onEdit, onDelete }) => {
    if (!recipe) return null;
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleConfirmDelete = (value) => {
        setConfirmDelete(value);
    }
    return (
        <ModalBody className='w-[80vw] h-full max-h-[80vh]' title='Recipe Details' onClose={onClose}>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/2 flex flex-col p-8 bg-main-white overflow-y-auto">
                        <div className="mb-6">
                            <h4 className="text-[10px] font-bold text-text-light tracking-widest uppercase mb-2">Recipe Name</h4>
                            <h3 className="text-xl font-medium text-text">{recipe.name}</h3>
                        </div>
                        
                        <div className="flex flex-col flex-1">
                            <h4 className="text-[10px] font-bold text-text-light tracking-widest uppercase mb-3">Instructions</h4>
                            <div className="flex-1 bg-main p-5 rounded-xl border border-border/50">
                                <p className="text-sm text-text/80 whitespace-pre-wrap leading-relaxed">
                                    {recipe.instructions || 'No instructions provided.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2 flex flex-col p-8 bg-main/50 border-l border-border/50">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h4 className="text-[10px] font-bold text-text-light tracking-widest uppercase">Ingredients Needed</h4>
                            <span className="bg-main-white border border-border/50 text-text text-[10px] py-1 px-3 rounded-full font-medium">
                                {recipe.ingredients?.length || 0} Items
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {recipe.ingredients?.map((item) => {
                                const isMissing = item.is_missing ?? Number(item.ingredient_stock) < Number(item.amount_needed);

                                return (
                                <div
                                    key={item.ingredient_id}
                                    className={cn(
                                        'flex items-center justify-between p-4 bg-main-white rounded-xl shadow-sm border border-border/50 transition',
                                        isMissing && 'bg-error-fill/35 border-error/60'
                                    )}
                                >
                                    <h5 className={cn('flex-1 truncate font-medium text-sm text-text pr-4', isMissing && 'text-error')}>
                                        {item.ingredient_name}
                                    </h5>
                                    
                                    <div className={cn('flex items-baseline gap-1.5 shrink-0 bg-main px-3 py-1.5 rounded-lg border border-border/30', isMissing && 'border-error/40 bg-main-white')}>
                                        <h4 className={cn('text-sm font-semibold text-accent-dark', isMissing && 'text-error')}>
                                            {item.amount_needed}
                                        </h4>
                                        <span className={cn('text-[10px] font-medium text-text-light', isMissing && 'text-error')}>
                                            {item.ingredient_unit}
                                        </span>
                                    </div>
                                </div>
                                )
                            })}

                            {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                                <div className="flex items-center justify-center h-full text-text-light text-xs">
                                    No ingredients listed for this recipe.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 p-6 border-t border-border bg-main-white flex gap-2 justify-end items-center z-10">
                    <Button variant='error' text='Delete Recipe' onClick={() => handleConfirmDelete(true)} />
                    <Button variant='modalOutline' text='Close View' onClick={onClose} />
                    <Button variant='modalBlock' text='Edit Recipe' onClick={() => onEdit(recipe)} />
                </div>

                {confirmDelete &&
                    <ConfirmationModal title="Delete Recipe?" content="Are you sure you want to delete this recipe? This action cannot be undone." onConfirm={() => onDelete(recipe.id)} onReject={() => handleConfirmDelete(false)} />
                }
        </ModalBody>
    );
};

export default ViewRecipeModal;