import { cn } from '@/utils/cn';
import React, { useState } from 'react'

const ProductCard = ({ product = { name: '', image: null }, onToggle, isArchived, selected = [] }) => {
    const handleToggleClick = () => {
        if (isArchived) {
            onToggle(product.id)
        } else {
            onToggle(product)
        }
    };

    return (
        <div onClick={handleToggleClick} 
            className={cn('cursor-pointer flex flex-col gap-4 px-2 py-2 rounded-4xl h-full shadow-md shadow-black/15 hover:shadow-black/25 duration-200 ease-in-out min-h-60', selected.some(select => select === product.id) && 'border border-border')}
        >
            <div className='flex aspect-square h-40 rounded-3xl overflow-hidden justify-center items-center'>
                {product.image ?
                    <img className='object-contain rounded-3xl aspect-square h-40' src={product.image} />
                    :
                    <h5 className='font-semibold text-text/50'>
                        No Image
                    </h5>
                }
            </div>

            <div className='text-center mt-auto'>
                <h5 className='font-semibold text-sm'>{product.name}</h5>
            </div>
        </div>
    )
}

export default ProductCard