import React, { useEffect, useState } from 'react';
import { Title, Dropdown, Button } from '../components/atoms';
import { ProductCard } from '../components/molecules';
import { Archive, Plus, Settings, Minus } from 'lucide-react';
import DrinksData from '../data/DrinksData'
import {AddProductModal, ArchivedModal} from '../components/organisms';
import useProduct from '@/hooks/useProduct'

const Products = () => {
    const {productData, productLoading, productError} = useProduct();
    const [filter, setFilter] = useState(null);

    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showArchivedModal, setShowArchivedModal] = useState(false);

    if (productLoading) return <h5>Loading product data</h5>
    if (productError) return <h5>Error loading product data</h5>

    // useEffect(() => {
    //     if (filter) {
    //         setProducts([...DrinksData].filter((drink, index) => drink.category === filter))
    //     } else {
    //         setProducts([...DrinksData])
    //     }
    // }, [filter])

    const handleShowAddProductModal = () => {
        setShowAddProductModal(!showAddProductModal);
    }

    const addProduct = (value) => {
        // if (value) {
        //     setProducts([...products, value])
        // }
        // handleShowAddProductModal();
    }

    const handleSetFilter = (value) => {
        setFilter(value);
    }

    const productSelection = {
        Drinks: "drinks",
        Cakes: "cakes",
        Cupcakes: "cupcakes"
        }

    const listProducts = productData.results.map(product => <ProductCard 
        product={product} 
        key={product.id} 
        />)

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-row justify-between'>
                <div className='flex items-center'>
                    <Dropdown value={filter} selection='Filter Product' onSelect={setFilter} options={productSelection} size='regular' />
                    {filter && <Minus className='text-text/50 ml-2 cursor-pointer' onClick={() => handleSetFilter(null)} />}
                    <div className='mx-4' />
                    <Button variant='block2' text='Archives' icon={Archive} onClick={() => setShowArchivedModal(true)} />
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

            {showArchivedModal &&
            <ArchivedModal onClose={setShowArchivedModal} />
            }
        </div>
    )
}

export default Products;