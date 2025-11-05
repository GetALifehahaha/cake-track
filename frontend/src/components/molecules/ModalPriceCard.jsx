import React from 'react';
import { Label } from '../atoms';

const ModalPriceCard = ({text, amount=0}) => {
    return (
        <div className='flex-1 py-2 bg-main rounded-sm flex flex-col gap-2 justify-center items-center'>
            <Label variant='small' text={text}/>
            <h5 className='text-text font-medium'>
                ₱ {Number(amount).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </h5>
        </div>
    )
}

export default ModalPriceCard;