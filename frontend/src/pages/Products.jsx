import React, { useEffect, useState } from 'react';
import { Title, Dropdown, Button } from '../components/atoms';
import { ProductCard } from '../components/molecules';
import { Archive, Plus, Settings, Minus } from 'lucide-react';
import {AddProductModal, ArchivedModal} from '../components/organisms';
import useProduct from '@/hooks/useProduct'
import useCategory from '@/hooks/useCategory';

const Products = () => {
    const {categoryData, categoryLoading, categoryError, categoryResponse} = useCategory();
    const {postProduct, productData, productLoading, productError, productResponse, refresh} = useProduct();
    const [filter, setFilter] = useState(null);

    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showArchivedModal, setShowArchivedModal] = useState(false);

    useEffect(() => {
        if (productResponse) {
            handleCloseAddProductModal();
            refresh();
        }
    }, [productResponse])

    if (productLoading) return <h5>Loading product data</h5>
    if (productError) return <h5>Error loading product data</h5>
    if (categoryLoading) return <h5>Loading category data</h5>
    if (categoryError) return <h5>Error loading category data</h5>

    const handleShowAddProductModal = () => {
        setShowAddProductModal(!showAddProductModal);
    }
    
    const handleCloseAddProductModal = () => {
        setShowAddProductModal(false);
    }

    const addProduct = async (value) => {
        if (value) {
            await postProduct(value);
            // if (productResponse) {
            //     handleCloseAddProductModal();
            //     refresh();
            // }
        }
    }

    const handleSetFilter = (value) => {
        setFilter(value);
    }

    const categoryOptions = categoryData.map((cat) => { return {key: cat.name, value: cat.id}})

    const listProducts = productData.results.map(product => <ProductCard 
        product={product} 
        key={product.id} 
        />)

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-row justify-between'>
                <div className='flex items-center'>
                    <Dropdown value={filter} selection='Filter Product' onSelect={setFilter} options={categoryOptions} size='regular' />
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
            <AddProductModal categoryOptions={categoryOptions} onConfirm={addProduct} onClose={handleCloseAddProductModal} />
            }

            {showArchivedModal &&
            <ArchivedModal onClose={setShowArchivedModal} />
            }
        </div>
    )
}

export default Products;