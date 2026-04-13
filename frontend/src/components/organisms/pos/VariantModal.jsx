import React, { useMemo, useState } from 'react';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import { AlertTriangle, Check, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms';
import { formatQty } from '@/utils/recipeUnits';

const VariantModal = ({product, onClose, onChoose, initialInspectVariantId = null}) => {

    const [selected, setSelected] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const parsedInitialInspectVariantId = Number(initialInspectVariantId);
    const [inspectedVariantId, setInspectedVariantId] = useState(
        Number.isFinite(parsedInitialInspectVariantId) ? parsedInitialInspectVariantId : null,
    );

    const toNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const isIngredientMissing = (ingredient) => {
        if (typeof ingredient?.is_missing === 'boolean') {
            return ingredient.is_missing;
        }

        return toNumber(ingredient?.ingredient_stock) < toNumber(ingredient?.amount_needed);
    };

    const inspectedVariant = useMemo(() => {
        return (product?.variants || []).find((variant) => Number(variant?.id) === Number(inspectedVariantId)) || null;
    }, [inspectedVariantId, product?.variants]);

    const inspectedIngredients = Array.isArray(inspectedVariant?.recipe_details?.ingredients)
        ? inspectedVariant.recipe_details.ingredients
        : [];

    const missingIngredientCount = inspectedIngredients.filter(isIngredientMissing).length;

    const selectVariant = () => {
        if (!selected.length) {
            setFeedback({
                type: 'error',
                label: 'No selected variants',
                details: 'Please select at least one variant to add to cart'
            })
            return;
        }

        selected.forEach(item => {
            onChoose(item.variant, item.amount)
        })
    }

    const getMaxOrderable = (variant) => Number(variant?.maxOrderable || 0);

    const selectOption = (id, variant) => {
        if (variant?.isInsufficient || getMaxOrderable(variant) < 1) {
            return;
        }

        setSelected(prev => {
            const exists = prev.some(
                item => item.id === id
            )

            if (exists) {
                return prev.filter(
                    item => !(item.id === id)
                )
            }

            return [...prev, { id, variant, amount: 1 }]
        })
    }

    const handleSetAmount = (e, id, change) => {
        e.stopPropagation();

        setSelected(prev =>
            prev.map(item => {
                if (item.id === id) {
                    const newQty = item.amount + change
                    const maxOrderable = getMaxOrderable(item.variant)

                    if (newQty === 100) return item
                    if (change > 0 && newQty > maxOrderable) return item

                    return {
                        ...item,
                        amount: newQty < 1 ? 1 : newQty
                    }
                }
                return item
            })
        )
    }

    const isSelected = (id) =>
        selected.some(
            item => item.id === id
        )

    const getAmount = (id) => {
        const found = selected.find(item => item.id === id)
        return found ? found.amount : 1
    }

    return (
        <ModalBody title='Select Product' subtitle={product.name} onClose={onClose}>
            <div className='flex flex-col gap-2'>
                {product?.variants?.map((variant) => {
                    const { id, label, price } = variant;
                    const isUnavailableVariant = Boolean(variant?.isInsufficient || getMaxOrderable(variant) < 1);
                    const isInspectingVariant = Number(inspectedVariantId) === Number(id);
                    const amount = getAmount(id);
                    const disableAdd = amount >= getMaxOrderable(variant);

                    return (
                    <div 
                    key={id} 
                    className={cn(
                        'flex flex-row gap-2 items-center p-3.5 rounded-md border-2 border-border/75 basis-1/5 cursor-pointer hover:bg-border',
                        isSelected(id) && 'border-accent-mute bg-main-dark/25',
                        isUnavailableVariant && 'opacity-70 border-error/35 bg-error-fill/5',
                        isUnavailableVariant && isInspectingVariant && 'border-error bg-error-fill/15',
                    )}
                    onClick={() => {
                        if (isUnavailableVariant) {
                            setInspectedVariantId((prev) => (Number(prev) === Number(id) ? null : id));
                            return;
                        }

                        setInspectedVariantId(null);
                        selectOption(id, {
                            ...product,
                            variant_id: id,
                            label,
                            price,
                            amount: 1,
                            maxOrderable: variant?.maxOrderable,
                            isInsufficient: variant?.isInsufficient,
                        })
                    }}
                    >
                        <div className={cn('flex items-center justify-center rounded-full border-gray border p-0.5 mr-2', isSelected(id) && 'bg-accent-mute border-accent-mute')}>
                            <Check size={14} className={cn('text-white opacity-0', isSelected(id) && 'opacity-100')} />
                        </div>
                        <h5 className='font-semibold text-md text-text mr-4'>{label}</h5>
                        <h5 className='font-semibold text-accent-mute'>₱ {price}</h5>
                        {isUnavailableVariant && (
                            <h5 className='text-xs font-semibold text-error ml-auto'>
                                {isInspectingVariant ? 'Viewing ingredients' : 'Insufficient - View ingredients'}
                            </h5>
                        )}
                        
                        {isSelected(id) && !isUnavailableVariant &&
                            <div className='flex flex-row items-center gap-2 ml-auto'>
                                <button className='bg-accent-mute text-white p-2 rounded-full cursor-pointer' onClick={(e) => handleSetAmount(e, id, -1)}><Minus size={12}/></button>
                                <h5 className={cn('text-text font-sm w-6 text-center', product.amount == 99 && 'font-semibold')}>{getAmount(id)}</h5>
                                <button
                                    disabled={disableAdd}
                                    className={cn('bg-accent-mute text-white p-2 rounded-full cursor-pointer', disableAdd && 'opacity-40 cursor-not-allowed')}
                                    onClick={(e) => handleSetAmount(e, id, 1)}
                                >
                                    <Plus size={12}/>
                                </button>
                            </div>
                        }
                    </div>
                )})}

                {inspectedVariant && (
                    <div className='mt-2 rounded-lg border border-error/40 bg-error-fill/10 p-3'>
                        <div className='flex items-center gap-2'>
                            <AlertTriangle size={16} className='text-error' />
                            <h5 className='text-sm font-semibold text-error'>
                                Ingredient Availability for {inspectedVariant?.label || 'Selected Variant'}
                            </h5>
                            <h5 className='text-xs font-semibold text-error/75 ml-auto'>
                                Missing {missingIngredientCount} of {inspectedIngredients.length}
                            </h5>
                        </div>

                        {inspectedIngredients.length > 0 ? (
                            <div className='mt-3 flex flex-col gap-2'>
                                {inspectedIngredients.map((ingredient) => {
                                    const requiredCount = toNumber(ingredient?.amount_needed);
                                    const inventoryCount = toNumber(ingredient?.ingredient_stock);
                                    const isMissing = isIngredientMissing(ingredient);
                                    const shortage = Math.max(requiredCount - inventoryCount, 0);
                                    const unitLabel = ingredient?.ingredient_unit || '';

                                    return (
                                        <div
                                            key={ingredient?.ingredient_id || `${inspectedVariant?.id}-${ingredient?.ingredient_name}`}
                                            className={cn(
                                                'rounded-md border p-2',
                                                isMissing ? 'border-error bg-error-fill/20' : 'border-border/70 bg-main-white',
                                            )}
                                        >
                                            <div className='flex items-center gap-2 justify-between'>
                                                <h5 className={cn('text-sm font-semibold', isMissing ? 'text-error' : 'text-text')}>
                                                    {ingredient?.ingredient_name || 'Unnamed ingredient'}
                                                </h5>
                                                {isMissing ? 
                                                <X className='h-4 w-4 text-error' /> :
                                                <Check className='h-4 w-4 text-success' />}
                                            </div>

                                            <div className='mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
                                                <h5 className={cn('font-semibold', isMissing ? 'text-error' : 'text-text/70')}>
                                                    Required: {formatQty(requiredCount)} {unitLabel}
                                                </h5>
                                                <h5 className={cn('font-semibold', isMissing ? 'text-error' : 'text-text/70')}>
                                                    Inventory: {formatQty(inventoryCount)} {unitLabel}
                                                </h5>
                                                {isMissing && (
                                                    <h5 className='font-semibold text-error'>
                                                        Missing: {formatQty(shortage)} {unitLabel}
                                                    </h5>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <h5 className='mt-2 text-xs font-medium text-text/70'>
                                No ingredient details found for this variant.
                            </h5>
                        )}
                    </div>
                )}

                {product.variants.length === 0 &&
                    <h5 className='font-medium text-text/50 mx-auto text-sm'>There are no product variants yet</h5>
                }
                {feedback &&
                    <ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
                }
                <div className='flex gap-2 mt-8 ml-auto'>
                    <Button text='Cancel' variant='modalOutline' size='small' onClick={onClose} />
                    {product.variants.length > 0 &&
                        <Button text='Add Order' variant='modalBlock' className={cn('bg-accent-dark', selected.length === 0 && 'opacity-50')} size='small' onClick={selectVariant} />
                    }
                </div>
            </div>
        </ModalBody>
    )
}

export default VariantModal;