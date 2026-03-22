import React, { useState } from 'react';
import { ModalFeedbackCard, ModalErrorState } from '../../molecules';
import { Button, Dropdown } from '../../atoms';
import { X, UtensilsCrossed, Info, List, Search } from 'lucide-react';
import useIngredient from '@/hooks/useIngredient';
import Loading from '@/components/molecules/Loading';
import ConfirmationModal from '../ConfirmationModal';
import { RecipeModalSkeleton } from '@/components/molecules/Skeletons';
import { formatQty } from '@/utils/recipeUnits';

const buildIngredientUnitOptions = (ingredient) => {
    const baseUnit = ingredient?.unit;
    const conversionUnits = (ingredient?.conversions || [])
        .map(conversion => ({
            unit: conversion.from_unit,
            multiplierToBase: Number(conversion.multiplier_to_base || 1),
        }))
        .filter(entry => entry.unit);

    const unique = new Map();

    if (baseUnit?.id) {
        unique.set(baseUnit.id, {
            value: baseUnit.id,
            label: baseUnit.abbreviation || baseUnit.name,
            multiplierToBase: 1,
        });
    }

    conversionUnits.forEach(entry => {
        if (!unique.has(entry.unit.id)) {
            unique.set(entry.unit.id, {
                value: entry.unit.id,
                label: entry.unit.abbreviation || entry.unit.name,
                multiplierToBase: entry.multiplierToBase,
            });
        }
    });

    return Array.from(unique.values());
};

const AddRecipeModal = ({ onClose, onConfirm }) => {
    const { ingredientAll, ingredientLoading, ingredientError, refresh } = useIngredient();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [search, setSearch] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => onClose(), 150);
    };

    if (ingredientLoading) return <RecipeModalSkeleton onClose={onClose} />;
    if (ingredientError) return <ModalErrorState onClose={onClose} onRetry={refresh} title='Failed to load ingredients' details='Unable to load ingredients for recipe creation.' />;

    const toggleConfirmationModal = () => setConfirmationModal(prev => !prev);

    const validateStep1 = () => {
        if (!name.trim() || !instructions.trim()) {
            setFeedback({
                label: 'Missing Information',
                details: "Please provide a recipe name and instructions.",
                type: 'error'
            });
            return false;
        }
        setFeedback(null);
        return true;
    };

    const validateStep2 = () => {
        if (selectedIngredients.length === 0) {
            setFeedback({
                label: 'Missing Ingredients',
                details: "Please select at least one ingredient.",
                type: 'error'
            });
            return false;
        }
        
        const hasEmptyAmounts = selectedIngredients.some(item => !item.amount_needed || Number(item.amount_needed) <= 0);
        if (hasEmptyAmounts) {
            setFeedback({
                label: 'Invalid Measurements',
                details: "Please specify a valid amount for all selected ingredients.",
                type: 'error'
            });
            return false;
        }

        setFeedback(null);
        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (e.target.value.length > 50) return;
        setSearch(e.target.value);
    };

    const handleName = (e) => {
        e.preventDefault();
        if (e.target.value.length > 50) return;
        setName(e.target.value);
    };
    
    const handleInstructions = (e) => {
        e.preventDefault();
        setInstructions(e.target.value);
    };

    const handleAddIngredient = (ingredient) => {
        if (selectedIngredients.some(item => item.ingredient_id === ingredient.id)) return;
        const unitOptions = buildIngredientUnitOptions(ingredient);
        const defaultUnitId = ingredient?.unit?.id || unitOptions[0]?.value || null;
        const defaultUnitLabel = unitOptions.find(option => option.value === defaultUnitId)?.label || '';
        
        setSelectedIngredients(prev => [
            ...prev, 
            { 
                ingredient_id: ingredient.id, 
                ingredient_name: ingredient.name, 
                amount_needed: '', 
                base_unit_id: ingredient?.unit?.id,
                display_unit_id: defaultUnitId,
                display_unit_label: defaultUnitLabel,
                unit_options: unitOptions,
            }
        ]);
    };

    const handleRemoveIngredient = (index) => {
        setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
    };

    const handleUpdateAmount = (index, e) => {
        if (!/^\d*\.?\d{0,4}$/.test(e.target.value)) return;
        if (e.target.value.length > 11) return;

        const updated = selectedIngredients.map((item, i) => 
            i === index ? { ...item, amount_needed: e.target.value } : item
        );
        setSelectedIngredients(updated);
    };

    const handleAmountBlur = (index) => {
        setSelectedIngredients(prev => prev.map((item, i) => {
            if (i !== index || item.amount_needed === '') return item;
            return { ...item, amount_needed: formatQty(item.amount_needed) };
        }));
    };

    const handleSelectUnit = (index, selectedUnitId) => {
        setSelectedIngredients(prev => prev.map((item, i) => {
            if (i !== index || item.unit_options.length <= 1) return item;
            const currentIdx = item.unit_options.findIndex(o => o.value === item.display_unit_id);
            const nextIdx = item.unit_options.findIndex(o => o.value === selectedUnitId);
            if (nextIdx < 0 || nextIdx === currentIdx) return item;
            const currentOption = item.unit_options[currentIdx];
            const nextOption = item.unit_options[nextIdx];
            const numericAmount = Number(item.amount_needed || 0);
            const convertedAmount = item.amount_needed
                ? (numericAmount * Number(currentOption?.multiplierToBase || 1)) / Number(nextOption?.multiplierToBase || 1)
                : '';
            return {
                ...item,
                display_unit_id: nextOption.value,
                display_unit_label: nextOption.label,
                amount_needed: convertedAmount === '' ? '' : formatQty(convertedAmount),
            };
        }));
    };

    const confirmSubmit = () => {
        if (!validateStep2()) return;
        toggleConfirmationModal();
    };

    const handleSubmit = async () => {
        const payload = {
            name,
            instructions,
            ingredients: selectedIngredients.map(item => ({
                ingredient_id: item.ingredient_id,
                amount_needed: parseFloat((item.amount_needed || 0)),
                input_unit_id: item.display_unit_id,
            }))
        };

        await onConfirm(payload);
    };

    const filteredIngredients = ingredientAll?.filter(ing => 
        ing.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8 ${!closing ? 'animate-in fade-in duration-150' : 'animate-out fade-out duration-150 fill-mode-forwards'}`}>
            <div className={`flex w-full max-w-7xl h-[85vh] bg-main-white rounded-2xl shadow-2xl overflow-hidden relative ${!closing ? 'animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-150' : 'animate-out fade-out zoom-out-95 slide-out-to-bottom-3 duration-150 fill-mode-forwards'}`}>
                
                <div className="w-64 bg-accent-mute flex flex-col text-main-white p-6 shrink-0">
                    <div className="flex items-center gap-3 mb-12 mt-2 ml-2">
                        <UtensilsCrossed size={24} />
                        <h2 className="text-lg font-semibold">Add Recipe</h2>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => setStep(1)}
                            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-sm ${step === 1 ? 'bg-black/10 font-medium' : 'hover:bg-black/5 text-main-white/80'}`}
                        >
                            <Info size={20} />
                            <span>Basic Info</span>
                        </button>
                        
                        <button 
                            onClick={() => validateStep1() && setStep(2)}
                            className={`flex items-center justify-between w-full p-3 rounded-xl transition-colors text-sm ${step === 2 ? 'bg-black/10 font-medium' : 'hover:bg-black/5 text-main-white/80'}`}
                        >
                            <div className="flex items-center gap-3">
                                <List size={20} />
                                <span>Ingredients</span>
                            </div>
                            {selectedIngredients.length > 0 && (
                                <span className="bg-main-white/20 text-main-white text-[10px] py-0.5 px-2 rounded-full">
                                    {selectedIngredients.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <button onClick={handleClose} className="absolute top-6 right-6 text-text-light hover:text-text transition-colors z-10">
                        <X size={24} />
                    </button>

                    {step === 1 && (
                        <div className="flex-1 overflow-y-auto p-12 flex flex-col">
                            <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
                                <h2 className="text-2xl font-medium text-text mb-2">Basic Information</h2>
                                <p className="text-sm text-text-light mb-10">Give your recipe a name and detailed instructions.</p>

                                <div className="mb-8">
                                    <label className="block text-xs font-medium text-text mb-2">Recipe Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={handleName} 
                                        placeholder="What are we cooking?" 
                                        className="w-full bg-main p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-text text-sm placeholder:text-text-light/50"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col min-h-[300px]">
                                    <label className="block text-xs font-medium text-text mb-2">Instructions</label>
                                    <textarea 
                                        value={instructions} 
                                        onChange={handleInstructions} 
                                        placeholder="Break down the process step by step..." 
                                        className="w-full flex-1 bg-main p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-text text-sm placeholder:text-text-light/50 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex-1 overflow-hidden p-12 flex flex-col">
                            <h2 className="text-2xl font-medium text-text mb-2">Ingredients</h2>
                            <p className="text-sm text-text-light mb-8">Select ingredients and specify their measurements.</p>

                            <div className="flex flex-1 gap-8 overflow-hidden">
                                <div className="w-2/5 flex flex-col overflow-hidden">
                                    <div className="relative mb-4 shrink-0">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
                                        <input 
                                            type="text" 
                                            placeholder="Find an ingredient..." 
                                            value={search} 
                                            onChange={handleSearch} 
                                            className="w-full bg-main py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-text text-sm" 
                                        />
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
                                        {filteredIngredients.map(ing => (
                                            <div 
                                                key={ing.id} 
                                                onClick={() => handleAddIngredient(ing)} 
                                                className="p-4 rounded-xl border border-border bg-main-white cursor-pointer hover:border-accent hover:shadow-sm transition-all flex flex-col gap-1"
                                            >
                                                <h5 className="font-medium text-sm text-text">{ing.name}</h5>
                                                <p className="text-[10px] text-text-light">Stock: {formatQty(ing?.total_stock || 0)} {ing?.unit?.abbreviation}</p>
                                            </div>
                                        ))}
                                        {filteredIngredients.length === 0 && (
                                            <p className="text-xs text-text-light text-center py-8">No ingredients found.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="w-3/5 flex flex-col overflow-hidden bg-main/50 rounded-2xl p-5">
                                    <h4 className="text-[10px] font-bold text-text-light tracking-widest uppercase mb-5 shrink-0 pl-1">Measurements</h4>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 pb-4">
                                        {selectedIngredients.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-main-white rounded-lg shadow-sm border border-border/50">
                                                <h5 className="flex-1 font-medium text-xs text-text truncate pl-2">{item.ingredient_name}</h5>
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                    <input 
                                                        type="text" 
                                                        placeholder="0.00" 
                                                        value={item.amount_needed} 
                                                        onChange={(e) => handleUpdateAmount(index, e)}
                                                        onBlur={() => handleAmountBlur(index)}
                                                        className="min-w-14 px-2 py-1.5 bg-main rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-accent text-center" 
                                                    />
                                                    <div className="w-20">
                                                        <Dropdown
                                                            size="full"
                                                            variant="modal"
                                                            value={item.display_unit_id}
                                                            selection={item.display_unit_label || 'Unit'}
                                                            options={(item.unit_options || []).map(option => ({ key: option.label, value: option.value }))}
                                                            onSelect={(value) => handleSelectUnit(index, value)}
                                                            allowNone={false}
                                                        />
                                                    </div>
                                                    </div>
                                                    {/* {item.amount_needed && (
                                                        <h6 className='text-[10px] text-text/50'>
                                                            {(() => {
                                                                const unit = item.unit_options.find(option => option.value === item.display_unit_id);
                                                                const baseAmount = Number(item.amount_needed || 0) * Number(unit?.multiplierToBase || 1);
                                                                const baseLabel = item.unit_options[0]?.label || item.display_unit_label;
                                                                return `${formatQty(baseAmount)} ${baseLabel}`;
                                                            })()}
                                                        </h6>
                                                    )} */}
                                                </div>
                                                <button onClick={() => handleRemoveIngredient(index)} className="p-1.5 text-text-light hover:text-error transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedIngredients.length === 0 && (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-xs text-text-light text-center">Select ingredients from the left list.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="shrink-0 border-t border-border p-6 flex items-center justify-between bg-main-white z-10">
                        <div className="w-1/3">
                            <button onClick={handleClose} className="text-text-light hover:text-text font-medium text-xs transition-colors">
                                Discard Changes
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 w-2/3 justify-end">
                            {feedback && <ModalFeedbackCard label={feedback.label} type={feedback.type} details={feedback.details} />}
                            
                            {step === 2 && (
                                <Button variant="modalOutline" text="Back" onClick={() => setStep(1)} />
                            )}
                            
                            {step === 1 ? (
                                <Button variant="modalBlock" text="Next Step" onClick={handleNext} />
                            ) : (
                                <Button variant="modalBlock" text="Save Recipe" onClick={confirmSubmit} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {confirmationModal &&
                <ConfirmationModal 
                    title="Adding recipe" 
                    content="Are you sure you want to add this recipe?" 
                    onConfirm={handleSubmit} 
                    onReject={toggleConfirmationModal}
                />
            }
        </div>
    );
};

export default AddRecipeModal;