import React from 'react';
import { ModalBody } from '../molecules';
import { Title } from '../atoms';
import { X } from 'lucide-react';

const SizeModal = ({product, onClose, onChoose}) => {
    return (
        <ModalBody>
            <div className='flex justify-between items-center w-full'>
                <Title variant='modal' text='Sizes' />
                <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
            </div>

            <div className='flex gap-2'>
                {product.sizes.map(({id, size, price}) => 
                    <div 
                    key={id} 
                    className='flex flex-col gap-2 items-center p-2.5 rounded-md border border-border basis-1/5 cursor-pointer hover:bg-main-dark'
                    onClick={() => {onChoose({...product, size_id: id, size: size, price: price, amount: 1}); onClose()}}
                    >
                        <h5 className='font-bold text-xl text-text'>{size}</h5>

                        <h5 className='font-semibold text-text/75'>₱ {price}</h5>
                    </div>
                )}
                {product.sizes.length === 0 &&
                    <h5 className='font-medium text-text/50 mx-auto text-sm'>No Sizes to Show</h5>
                }
            </div>
        </ModalBody>
    )
}

export default SizeModal;