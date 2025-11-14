import React, { useState } from 'react';
import { Title, Dropdown, Button } from '../components/atoms';
import { ProductCard } from '../components/molecules';
import { Archive, Plus, Settings } from 'lucide-react';
import DrinksData from '../data/DrinksData'

const Products = () => {

    const [products, setProducts] = useState(DrinksData); 

    const productSelection = [
        {name: "Drinks", value: "drinks"},
        {name: "Cakes", value: "cakes"},
        {name: "Cupcakes", value: "cupcakes"},
    ]

    const listProducts = products.map(product => <ProductCard 
        product={product} 
        key={product.id} 
        />)

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-row justify-between'>
                <div className='flex items-center gap-4'>
                    <Dropdown selectionName='Filter Product' selections={productSelection} onSelect={(value) => console.log(value)}/>
                    <Button variant='block2' text='Archives' icon={Archive} />
                </div>
                <div className='flex items-center gap-4'>
                    <Button variant='block2' text='Manage Categories' icon={Settings} />
                    <Button variant='block' text='Add Item' icon={Plus} />
                </div>
            </div>

            <div className='grid grid-cols-7 p-2 gap-4 w-full flex-wrap overflow-x-auto'>
                {listProducts}
            </div>
        </div>
    )
}

export default Products;