import React, { useState } from 'react';
import { ModalBody } from '../../molecules';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms';

const VariantModal = ({product, onClose, onChoose}) => {

    const [selected, setSelected] = useState({id: null, variant: null});

    const selectVariant = () => {
        onChoose(selected.variant)
    }

    const selectOption = (id, variant) => {
        selected === id ? setSelected({id: null, variant: null}) : setSelected({id: id, variant: variant})
    }

    return (
        <ModalBody title='Select Size' subtitle={product.name} onClose={onClose}>
            <div className='flex flex-col gap-2'>
                {product?.variants?.map(({id, label, price}) => 
                    <div 
                    key={id} 
                    className={cn('flex flex-row gap-2 items-center p-3.5 rounded-md border-2 border-border/75 basis-1/5 cursor-pointer hover:bg-border', selected.id==id && 'border-accent-mute bg-main-dark/25')}
                    onClick={() => {selectOption(id, {...product, variant_id: id, label: label, price: price, amount: 1})}}
                    >
                        <div className={cn('flex items-center justify-center rounded-full border-gray border p-0.5', selected.id==id && 'bg-accent-mute border-accent-mute')}>
                            <Check size={14} className={cn('text-white opacity-0', selected.id == id && 'opacity-100')} />
                        </div>
                        <h5 className='font-semibold text-md text-text'>{label}</h5>

                        <h5 className='ml-auto font-semibold text-accent-mute'>₱ {price}</h5>
                    </div>
                )}
                {product.variants.length === 0 &&
                    <h5 className='font-medium text-text/50 mx-auto text-sm'>There are no product variants yet</h5>
                }
                <div className='flex gap-2 mt-8 ml-auto'>
                    <Button text='Cancel' variant='modalOutline' size='small' onClick={selectVariant} />
                    <Button text='Add Order' variant='modalBlock' className='bg-accent-dark' size='small' onClick={selectVariant} />
                </div>
            </div>
        </ModalBody>
    )
}

export default VariantModal;