import { EllipsisVertical } from 'lucide-react'
import React, { useState } from 'react'

const ProductCard = ({product={name: '', price: 0.00, imagePath: null}, onToggle}) => {
    const [showEdit, setShowEdit] = useState(false);
    const handleToggleShowEdit = () => setShowEdit(!showEdit);
    const handleToggleClick = () => onToggle(product);

    return (
        <div className='relative' >
            <button className={`absolute right-2 top-4 cursor-pointer hover:bg-main-dark rounded-md z-10`} onClick={handleToggleShowEdit}><EllipsisVertical size={20}/></button>
            {showEdit &&
            <div className=' -right-full -translate-x-10 top-4 absolute bg-main-white rounded-md shadow-sm p-1 min-w-40 z-100'>
                <button className='text-text/50 font-medium px-4 text-sm rounded-sm hover:bg-main-dark cursor-pointer w-full text-left '>Edit</button>
            </div>
            }
            <div onClick={handleToggleClick} className='cursor-pointer bg-main-white flex flex-col gap-4 px-2 py-4 rounded-4xl shadow-md shadow-black/15 hover:shadow-black/25'>
                {product.imagePath && 
                    <img className='object-contain aspect-square h-40' src={product.imagePath}/>
                }

                <div className='text-center mt-auto'>
                    <h5 className='font-semibold text-md'>{product.name}</h5>
                    <h5 className='text-md font-semibold text-accent-text'>₱ {Number(product.price || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                </div>
            </div>

            
            
        </div>
    )
}

export default ProductCard