import React from 'react'
import {ProductCard} from '../molecules'
import DrinksData from '../../data/DrinksData'

const ProductsGrid = ({onChangeCheckoutProduct}) => {

    const listProduct = DrinksData.map((drink) => <ProductCard product={drink} key={drink.id} onClick={(value) => handleOnChangeCheckoutProduct(drink, value)}/>)

    const handleOnChangeCheckoutProduct = (product, value) => {
        onChangeCheckoutProduct(product, value);
    }

    return (
        <div className='grid grid-cols-5 p-2 gap-4 w-full flex-wrap overflow-x-auto'>
            {listProduct}
        </div>
    )
}

export default ProductsGrid