import { EllipsisVertical } from 'lucide-react'
import React from 'react'

const ProductCard = ({product={name: '', price: 0.00, imagePath: null}}) => {
    return (
        <div className='bg-main flex flex-col gap-4 px-2 py-4 rounded-4xl shadow-md shadow-black/15 relative'>
            <button className='absolute right-2 top-4 cursor-pointer'><EllipsisVertical size={20}/></button>

            {product.imagePath && 
                <img className='object-contain aspect-square' src={product.imagePath}/>
            }

            <div className='flex-1 text-center'>
                <h5 className='font-medium text-sm'>{product.name}</h5>
                <h5 className='text-md font-semibold text-accent-text'>P {product.price}</h5>
            </div>
        </div>
    )
}

export default ProductCard