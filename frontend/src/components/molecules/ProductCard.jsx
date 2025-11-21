import React, { useState } from 'react'

const ProductCard = ({product={name: '', price: 0.00, image_path: null}, onToggle, isArchived, selected=null}) => {
    const handleToggleClick = () => {
        if (isArchived) {
            onToggle(product.id)
        } else {
            onToggle(product)
        }
    };

    return (
        <div onClick={handleToggleClick} className={`cursor-pointer flex flex-col gap-4 px-2 py-4 rounded-4xl h-full shadow-md shadow-black/15 hover:shadow-black/25 duration-200 ease-in-out ${selected==product.id ? '-translate-y-2 bg-main-dark' : 'bg-main-white'}`}>
            {product.image_path && 
                <img className='object-contain aspect-square h-40' src={product.image_path}/>
            }

            <div className='text-center mt-auto'>
                <h5 className='font-semibold text-md'>{product.name}</h5>
                <h5 className='text-md font-semibold text-accent-text'>₱ {Number(product.price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
            </div>
        </div>
    )
}

export default ProductCard