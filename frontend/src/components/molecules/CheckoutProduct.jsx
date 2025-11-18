import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '../atoms';
import {X, Plus, Minus} from 'lucide-react'

const CheckoutProduct = ({product={id: 0, name: "Product", price: 0, amount: 0}, onChangeAmount}) => {

    const handleSetAmount = (method) => {
        if (method == "minus") {
            if (product.amount-1==0) {
                return;
            }

            onChangeAmount(product.id, product.amount-1);
        } else if (method == "add") {
            onChangeAmount(product.id, product.amount+1);
        }

    }

    return (
        <div className='flex flex-row gap-8 w-full items-center px-4'>
            <div>
                <h5 className='font-medium text-sm'>{product.name}</h5>
                <h5 className='text-accent-text text-sm'>₱ {Number(product.price * product.amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
            </div>

            <div className='flex flex-row gap-4 items-center ml-auto'>
                <button className='text-accent border border-accent p-0.5 rounded-full cursor-pointer' onClick={() => handleSetAmount("minus")}><Minus size={12}/></button>
                <h5 className='text-text font-sm'>{product.amount}</h5>
                <button className='text-accent border border-accent p-0.5 rounded-full cursor-pointer' onClick={() => handleSetAmount("add")}><Plus size={12}/></button>
            </div>
        </div>
    )
}

export default CheckoutProduct;