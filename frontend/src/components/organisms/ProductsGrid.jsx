import React from 'react'
import {ProductCard} from '../molecules'

const ProductsGrid = ({products={DrinksData}, checkoutProducts={}, onToggleCheckoutProduct}) => {

    const listProduct = products.map((product) => 
        <ProductCard 
        product={product} 
        key={product.id} 
        isSelected={checkoutProducts.some(p => p.id == product.id)}
        onToggle={() => onToggleCheckoutProduct(product)}
        />)

    return (
        <div className='grid grid-cols-5 p-2 gap-4 w-full flex-wrap overflow-x-auto'>
            {listProduct}
        </div>
    )
}

export default ProductsGrid