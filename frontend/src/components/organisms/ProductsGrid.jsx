import React from 'react'
import {ProductCard} from '../molecules'
import DrinksData from '../../data/DrinksData'

const ProductsGrid = () => {

    const listProduct = DrinksData.map((drink, index) => <ProductCard product={drink} key={index}/>)

    return (
        <div className='grid grid-cols-5 p-2 gap-4 w-full flex-wrap overflow-x-auto'>
            {listProduct}
        </div>
    )
}

export default ProductsGrid