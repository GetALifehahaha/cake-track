import React from 'react';
import { Label, Button } from '../../atoms';
import { ModalBody } from '../../molecules';

const ViewRecipeModal = ({ recipe, onClose, onEdit }) => {
    if (!recipe) return null;

    return (
        <ModalBody title='Recipe Details' onClose={onClose} className='w-[60vw] h-[70vh]'>
            <div className='flex flex-1 overflow-hidden h-[50vh]'>
                {/* Left Column: Name and Instructions */}
                <div className='basis-1/2 flex flex-col p-6 border-r border-border/50 bg-main-white'>
                    <div className='flex flex-col gap-6 h-full'>
                        <div>
                            <Label text='Recipe Name' variant='modal' />
                            <h3 className='text-lg font-semibold text-text mt-2'>{recipe.name}</h3>
                        </div>
                        
                        <div className='flex-1 flex flex-col overflow-hidden'>
                            <Label text='Instructions' variant='modal' />
                            <div className='flex-1 overflow-y-auto mt-2 p-3 rounded-md bg-main-dark/10'>
                                <p className='text-sm text-text/80 whitespace-pre-wrap'>
                                    {recipe.instructions || 'No instructions provided.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Ingredients List */}
                <div className='basis-1/2 flex flex-col p-6 bg-accent-mute/25'>
                    <Label text={`Ingredients Needed (${recipe.ingredients?.length || 0})`} variant='modal' />
                    
                    <div className='flex-1 overflow-y-auto flex flex-col gap-3 mt-4 pr-2'>
                        {recipe.ingredients?.map((item) => (
                            <div key={item.ingredient_id} className='flex items-center justify-between p-3 bg-main-white rounded-md shadow-sm border border-border/25'>
                                <h5 className='flex-1 truncate font-medium text-sm'>{item.ingredient_name}</h5>
                                
                                <div className='flex flex-col items-end gap-1'>
                                    <h5 className='text-[10px] uppercase font-bold text-text/50 tracking-wider'>Quantity</h5>
                                    <h4 className='text-sm font-semibold'>
                                        {item.amount_needed} <span className='text-xs font-normal text-text/50'>{item.ingredient_unit}</span>
                                    </h4>
                                </div>
                            </div>
                        ))}

                        {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                            <div className='flex items-center justify-center h-full text-text/50 text-sm'>
                                No ingredients listed for this recipe.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className='flex justify-end gap-2 p-4 border-t border-border/50 bg-main-white'>
                <Button variant='modalOutline' text='Close' onClick={onClose} />
                {onEdit && (
                    <Button variant='modalBlock' text='Edit Recipe' onClick={() => onEdit(recipe)} />
                )}
            </div>
        </ModalBody>
    );
};

export default ViewRecipeModal;