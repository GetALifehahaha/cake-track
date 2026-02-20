import React, { useState } from 'react';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import { Button, Label } from '../../atoms';
import { X } from 'lucide-react';
import useIngredient from '@/hooks/useIngredient';
import Loading from '@/components/molecules/Loading';
import ConfirmationModal from '../ConfirmationModal';

const AddRecipeModal = ({ onClose, onConfirm }) => {

    const { ingredientAll, ingredientLoading, ingredientError } = useIngredient();
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [search, setSearch] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(false);

    if (ingredientLoading) return <Loading />
    if (ingredientError) return <h5>Error...</h5>

    const toggleConfirmationModal = () => setConfirmationModal(prev => !prev)

    const validateFields = () => {
        if (!name || !instructions || selectedIngredients.length === 0) {
            setFeedback({
                label: 'Missing Fields',
                details: "Please don't leave any missing fields",
                type: 'error'
            });
            
            return false;
        }

        return true;
    } 

    const handleSearch = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return;

        setSearch(e.target.value);
    }

    const handleName = (e) => {
        e.preventDefault();
        
        if (e.target.value.length > 50) return;
        
        setName(e.target.value);
    }
    
    const handleInstructions = (e) => {
        e.preventDefault();

        setInstructions(e.target.value);
    }

    const handleAddIngredient = (ingredient) => {
        if (selectedIngredients.some(item => item.ingredient_id === ingredient.id)) return;
        
        setSelectedIngredients(prev => [
            ...prev, 
            { ingredient_id: ingredient.id, ingredient_name: ingredient.name, amount_needed: 0, unit: ingredient.unit.abbreviation }
        ]);
    };

    const handleRemoveIngredient = (index) => {
        setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
    };

    const handleUpdateAmount = (index, e) => {
        if (!/^\d*\.?\d{0,2}$/.test(e.target.value)) return;

        if (e.target.value.length > 11) return

        const updated = selectedIngredients.map((item, i) => 
            i === index ? { ...item, amount_needed: e.target.value } : item
        );

        setSelectedIngredients(updated);
    };

    const confirmSubmit = () => {
        if (!validateFields()) return

        toggleConfirmationModal();
    }

    const handleSubmit = async () => {
        const payload = {
            name,
            instructions,
            ingredients: selectedIngredients.map(item => ({
                ingredient_id: item.ingredient_id,
                amount_needed: Number.parseFloat(item.amount_needed || 0)
            }))
        };

        await onConfirm(payload);
    };

    const filteredIngredients = ingredientAll?.filter(ing => 
        ing.name.toLowerCase().includes(search.toLowerCase())
    ) || [];


    return (
        <ModalBody title='Add Recipe' onClose={onClose} className='w-[90vw] h-[80vh]'>
            <div className='flex flex-1 overflow-hidden h-[60vh]'>
                <div className='basis-1/4 flex flex-col p-6 border-r border-border/50'>
                    <div className='flex flex-col gap-4 mb-4 h-full'>
                        <div>
                            <Label text='Recipe Name' variant='modal' />
                            <input type='text' value={name} onChange={handleName} className='w-full p-2 rounded-md bg-main-dark/50 focus:outline-none' />
                        </div>
                        <div className='flex-1 flex flex-col'>
                            <Label text='Instructions' variant='modal' />
                            <textarea value={instructions} onChange={handleInstructions} className='w-full flex-1 p-2 rounded-md bg-main-dark/50 focus:outline-none resize-y' />
                        </div>
                    </div>
                </div>

                <div className='flex-1 flex flex-col p-6 bg-accent-mute/25'>
                    <Label text='Available Ingredients' variant='modal' />
                    <input type='text' placeholder='Search an ingredient' value={search} onChange={handleSearch} className='w-full p-2 mb-4 rounded-md bg-main-white focus:outline-none' />
                    <div className='grid grid-cols-3 gap-2'>
                        {filteredIngredients.map(ing => (
                            <div key={ing.id} onClick={() => handleAddIngredient(ing)} className='flex flex-col gap-2 px-4 py-2 rounded-md bg-main-white text-sm font-medium cursor-pointer hover:scale-105 '>
                                <h5>{ing.name}</h5>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='basis-1/3 flex flex-col p-6'>
                    <Label text={`Selected Ingredients (${selectedIngredients.length})`} variant='modal'/>
                    <div className='flex-1 overflow-y-auto flex flex-col gap-3 mt-4'>
                        {selectedIngredients.map((item, index) => (
                            <div key={index} className='flex items-center gap-3 p-3 bg-main-dark/20 rounded-md'>
                                <h5 className='flex-1 truncate'>{item.ingredient_name}</h5>
                                <div className='flex flex-col gap-1 pb-2'>
                                    <h5 className='text-xs text-left uppercase font-medium text-text/50'>Quantity</h5>
                                    <input type='text' className='p-2 py-1.5 bg-main-dark/50 rounded-md focus:outline-none' placeholder='Enter Amount' value={item.amount_needed} onChange={(e) => handleUpdateAmount(index, e)} />
                                </div>
                                <X size={16} className='text-text cursor-pointer mx-4' onClick={() => handleRemoveIngredient(index)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            
                {feedback &&
                    <ModalFeedbackCard label={feedback.label} type={feedback.type} details={feedback.details} />
                }
            <div className='flex justify-end gap-2'>
                <Button variant='modalOutline' text='Cancel' onClick={onClose} />
                <Button variant='modalBlock' text='Save Recipe' onClick={confirmSubmit} />
            </div>
            {confirmationModal &&
                <ConfirmationModal title="Adding recipe" content="Are you sure you want to add this recipe?" onConfirm={handleSubmit} onReject={toggleConfirmationModal}/>
            }

        </ModalBody>
    );
};

export default AddRecipeModal;