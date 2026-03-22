import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '../atoms';
import {X, Plus, Minus} from 'lucide-react'
import { cn } from '@/lib/utils';

const CheckoutProduct = ({product, pricing, onChangeAmount}) => {

    const beforePrice = Number(pricing?.before ?? (product.price * product.amount || 0));
    const afterPrice = Number(pricing?.after ?? beforePrice);
    const isDiscounted = Boolean(pricing?.isApplicable && afterPrice < beforePrice);

    const handleSetAmount = (method) => {
        if (method == "minus") {
            if (product.amount-1==0) {
                return;
            }

            onChangeAmount(product.variant_id, product.amount-1);
        } else if (method == "add") {
            if (product.amount + 1 === 100) return
            onChangeAmount(product.variant_id, product.amount+1);
        }

    }

    return (
        <div className='flex flex-row gap-8 w-full items-center px-4'>
            <div>
                <h5 className='font-medium text-sm'>{product.name}</h5>
                <div className='flex items-center gap-2'>
                    <h5 className='font-medium text-sm text-text/50'>{product.label}</h5>
                    {isDiscounted ? (
                        <div className='flex items-center gap-1.5'>
                            <h5 className='font-medium text-xs text-text/40 line-through'>₱ {beforePrice.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                            <h5 className='font-semibold text-accent-text text-sm'>₱ {afterPrice.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                        </div>
                    ) : (
                        <h5 className='font-semibold text-accent-text text-sm'>₱ {beforePrice.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                    )}
                </div>
            </div>

            <div className='flex flex-row items-center gap-2 ml-auto'>
                <button className='text-accent border border-accent p-0.5 rounded-full cursor-pointer' onClick={() => handleSetAmount("minus")}><Minus size={12}/></button>
                <h5 className={cn('text-text font-sm w-6 text-center', product.amount == 99 && 'font-semibold')}>{product.amount}</h5>
                <button className='text-accent border border-accent p-0.5 rounded-full cursor-pointer' onClick={() => handleSetAmount("add")}><Plus size={12}/></button>
            </div>
        </div>
    )
}

export default CheckoutProduct;