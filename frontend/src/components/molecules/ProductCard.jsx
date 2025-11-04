import { EllipsisVertical } from 'lucide-react'
import React, { useState } from 'react'

const ProductCard = ({product={name: '', price: 0.00, imagePath: null}, onToggle}) => {
    const handleToggleClick = () => onToggle(product)

    return (
        <div className='bg-main-white flex flex-col gap-4 px-2 py-4 rounded-4xl shadow-md shadow-black/15 hover:shadow-black/25 relative cursor-pointer' onClick={handleToggleClick}>
            <button className='absolute right-2 top-4 cursor-pointer'><EllipsisVertical size={20}/></button>

            {product.imagePath && 
                <img className='object-contain aspect-square h-30' src={product.imagePath}/>
            }

            <div className='text-center mt-auto'>
                <h5 className='font-semibold text-md'>{product.name}</h5>
                <h5 className='text-md font-semibold text-accent-text'>₱ {Number(product.price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
            </div>
        </div>
    )
}

export default ProductCard