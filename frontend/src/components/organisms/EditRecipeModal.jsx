import React, { useState } from 'react';
import { Title, Label, Dropdown, Button } from '../atoms';
import { ModalFeedbackCard } from '../molecules';
import { Plus, X } from 'lucide-react';
import _ from 'lodash'

const EditRecipeModal = ({recipe, onConfirm, onClose, onDelete}) => {

    const units = {
        Pieces: 'pcs',
        Kilograms: "kg",
        Sticks: 'stk',
        Milliliter: "ml",
        Cup: "cup"
    }

    const [oldName, setOldName] = useState(recipe.name);
    const [oldIngredients, setOldIngredients] = useState(recipe.ingredients);

    const [name, setName] = useState(recipe.name);
    const [ingredients, setIngredients] = useState(recipe.ingredients);

    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const addIngredient = () => {
        setIngredients([...ingredients, {amount: 0, unit: '', name: ''}])
    }

    const removeIngredient = (id) => {
        setIngredients(ingredients.filter((_, index) => index != id))
    }

    const updateIngredient = (id, field, value) => {
        const updatedIngredient = ingredients.map((ingredient, index) => index == id ? {...ingredient, [field]: field == 'amount' ? Number.parseInt(value) || '' : value} : ingredient)
        setIngredients(updatedIngredient)
    }

    const handleConfirm = () => {
        if (!name || !ingredients || ingredients.length == 0) {
            setModalFeedbackContent({type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.`})
            setShowModalFeedback(true);
            return;
        }
        
        const hasEmptyIngredient = ingredients.some(ing => 
            !ing.amount || !ing.unit || !ing.name || 
            ing.amount.toString().trim() === '' || 
            ing.unit.trim() === '' || 
            ing.name.trim() === ''
        );
        
        if (hasEmptyIngredient) {
            setModalFeedbackContent({type: "error", label: "Incomplete Fields", details: `Please fill in all the ingredients, or remove empty ones.`})
            setShowModalFeedback(true);
            return;
        }
            
        if (oldName === name && JSON.stringify(oldIngredients) === JSON.stringify(ingredients)) {
            onClose();
            return;
        }

        onConfirm({id: recipe.id, name, ingredients})
    }

    const listIngredientInput = ingredients.map((ingredient, index) =>
        <div className='flex items-center gap-2 p-2'>
            <input onChange={(e) => updateIngredient(index, 'amount', e.target.value)} type='number' value={ingredient.amount} placeholder='e.g., 1' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' />
            <Dropdown size='full' variant='modal' selection="Unit" options={units} value={ingredient.unit} onSelect={(value) => updateIngredient(index, 'unit', value)} />
            <input onChange={(e) => updateIngredient(index, 'name', e.target.value)} type='text' value={ingredient.name} placeholder='e.g., Eggs' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' />
            <X size={40} className='text-text cursor-pointer' onClick={() => removeIngredient(index)} />
        </div>
    )

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] max-h-[80vh] flex flex-col gap-10'>
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='Edit Item' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Recipe Name'/>
                        <input type='text' placeholder='e.g., Chocolate Cake' value={name} onChange={(e) => setName(e.target.value)} 
                                className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                    </div>

                    <div className='flex flex-col items-center'>
                        <div className='w-full flex flex-row items-center justify-between'>
                            <Label variant='modal' text='Ingredient'/>
                            <Button icon={Plus} text='Add Ingredient' variant='modalOutline' onClick={addIngredient} />
                        </div>

                        <div className='flex flex-col gap-1 p-4 overflow-auto max-h-80'>
                            {listIngredientInput}
                        </div>
                    </div>

                    { showModalFeedback &&
                        <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                    }

                    <div className='flex gap-4 mt-4 ml-auto'>
                        <Button variant='modalOutline' size='modalSize' text='Delete' onClick={() => onDelete(recipe.id)}/>
                        <Button variant='modalBlock' size='modalSize' text='Save' onClick={handleConfirm}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditRecipeModal;