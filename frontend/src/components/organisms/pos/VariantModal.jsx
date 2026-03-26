import React, { useState } from 'react';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import { Check, Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms';

const VariantModal = ({product, onClose, onChoose}) => {

    const [selected, setSelected] = useState([]);
    const [feedback, setFeedback] = useState(null);

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
                    const amount = getAmount(id);
                    const disableAdd = amount >= getMaxOrderable(variant);

                    return (
                    <div 
                    key={id} 
                    className={cn(
                        'flex flex-row gap-2 items-center p-3.5 rounded-md border-2 border-border/75 basis-1/5 cursor-pointer hover:bg-border',
                        isSelected(id) && 'border-accent-mute bg-main-dark/25',
                        isUnavailableVariant && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={() => {
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
                        {isUnavailableVariant && <h5 className='text-xs font-semibold text-error ml-auto'>Insufficient</h5>}
                        
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