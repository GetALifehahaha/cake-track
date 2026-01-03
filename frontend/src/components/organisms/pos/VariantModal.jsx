import React from 'react';
import { ModalBody } from '../../molecules';
import { Title } from '../../atoms';
import { X } from 'lucide-react';

const VariantModal = ({product, onClose, onChoose}) => {
    return (
        <ModalBody>
            <div className='flex justify-between items-center w-full'>
                <Title variant='modal' text='Variants' />
                <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
            </div>

            <div className='flex gap-2'>
                {product?.variants?.map(({id, label, price}) => 
                    <div 
                    key={id} 
                    className='flex flex-col gap-2 items-center p-2.5 rounded-md border border-border basis-1/5 cursor-pointer hover:bg-border'
                    onClick={() => {onChoose({...product, variant_id: id, label: label, price: price, amount: 1}); onClose()}}
                    >
                        <h5 className='font-bold text-md text-text'>{label}</h5>

                        <h5 className='font-semibold text-text/75'>₱ {price}</h5>
                    </div>
                )}
                {product.variants.length === 0 &&
                    <h5 className='font-medium text-text/50 mx-auto text-sm'>No Product Variants to Show</h5>
                }
            </div>
        </ModalBody>
    )
}

export default VariantModal;