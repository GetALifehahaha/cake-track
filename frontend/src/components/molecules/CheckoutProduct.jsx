import React, { useEffect, useState } from 'react';
import { Button } from '../atoms';
import {X, Plus, Minus} from 'lucide-react'

const CheckoutProduct = ({product={id: 0, name: "Product", price: 0}, onChangeAmount, onToggle}) => {

    const [amountState, setAmountState] = useState(1);

    const handleOnToggle = () => {
        onToggle(product);
    }

    const handleSetAmount = (method) => {
        if (method == "minus") {
            setAmountState(amountState-1);

            if (amountState-1==0) {
                onToggle(product);
            }
        } else if (method == "add") {
            setAmountState(amountState+1);
        }

        onChangeAmount(amountState);
    }

    return (
        <div className='flex flex-row gap-8 w-full items-center'>
            <button className='text-main-white bg-gray p-0.5 rounded-full cursor-pointer' onClick={handleOnToggle}><X size={12}/></button>

            <div>
                <h5 className='font-medium text-sm'>{product.name}</h5>
                <h5 className='text-accent-text text-sm'>₱ {Number(product.price * amountState || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
            </div>

            <div className='flex flex-row gap-4 items-center ml-auto'>
                <button className='text-accent border border-accent p-0.5 rounded-full cursor-pointer' onClick={() => handleSetAmount("minus")}><Minus size={12}/></button>
                <h5 className='text-text font-sm'>{amountState}</h5>
                <button className='text-accent border border-accent p-0.5 rounded-full cursor-pointer' onClick={() => handleSetAmount("add")}><Plus size={12}/></button>
            </div>
        </div>
    )
}

export default CheckoutProduct;