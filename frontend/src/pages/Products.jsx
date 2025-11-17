import React, { useState } from 'react';
import { Title, Dropdown, Button } from '../components/atoms';
import { ProductCard } from '../components/molecules';
import { Archive, Plus, Settings } from 'lucide-react';
import DrinksData from '../data/DrinksData'
import AddProductModal from '../components/organisms/AddProductModal';

const Products = () => {

    const [products, setProducts] = useState(DrinksData); 

    const [showAddProductModal, setShowAddProductModal] = useState(false);

    const handleShowAddProductModal = () => {
        setShowAddProductModal(!showAddProductModal);
    }

    const addProduct = (value) => {
        if (value) {
            
        }


        handleShowAddProductModal();
    }

    const productSelection = {
        Drinks: "drinks",
        Cakes: "cakes",
        Cupcakes: "cupcakes"
        }

    const listProducts = products.map(product => <ProductCard 
        product={product} 
        key={product.id} 
        />)

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-row justify-between'>
                <div className='flex items-center gap-4'>
                    <span className='basis-1/2 '>
                        <Dropdown selection='Filter Product' options={productSelection} size='regular' />
                    </span>
                    <Button variant='block2' text='Archives' icon={Archive} />
                </div>
                <div className='flex items-center gap-4'>
                    <Button variant='block2' text='Manage Categories' icon={Settings} />
                    <Button variant='block' text='Add Item' icon={Plus} onClick={handleShowAddProductModal} />
                </div>
            </div>

            <div className='grid grid-cols-7 p-2 gap-4 w-full flex-wrap overflow-x-auto'>
                {listProducts}
            </div>

            {showAddProductModal &&
            <AddProductModal onConfirm={addProduct} />
            }
        </div>
    )
}

export default Products;