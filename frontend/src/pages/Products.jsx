import React, { useEffect, useState } from 'react';
import { Title, Dropdown, Button } from '../components/atoms';
import { ProductCard } from '../components/molecules';
import { Archive, Plus, Settings, Minus } from 'lucide-react';
import {AddProductModal, ArchivedModal, DiscountModal, CategoryModal} from '../components/organisms';
import useProduct from '@/hooks/useProduct'
import useCategory from '@/hooks/useCategory';
import { useSearchParams } from 'react-router-dom';
import EditProductModal from '@/components/organisms/EditProductModal';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {categoryData, categoryLoading, categoryError, categoryResponse} = useCategory();
    const {postProduct, productData, patchProduct, productLoading, productError, productResponse, refresh} = useProduct();
    const [filter, setFilter] = useState(null);
    const [prepEditProduct, setPrepEditProduct] = useState(null);

    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [showArchivedModal, setShowArchivedModal] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    useEffect(() => {
        if (productResponse) {
            handleCloseAddProductModal();
            handleCloseEditProductModal();
            handleCloseArchivedModal();
            setPrepEditProduct(null)
            refresh();
        }
    }, [productResponse])

    useEffect(() => {
        let params = new URLSearchParams();
        
        if (filter) params.set('category__name', filter)

        setSearchParams(params)
    }, [filter])

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

    const handleCloseArchivedModal = () => {
        setShowArchivedModal(false);
        setSearchParams("")
    }

    const handleShowArchivedModal = () => {
        setShowArchivedModal(true);
    }
    
    const handleShowDiscountModal = () => setShowDiscountModal(true);
    const handleCloseDiscountModal = () => setShowDiscountModal(false);
    const handleShowCategoryModal = () => setShowCategoryModal(true);
    const handleCloseCategoryModal = () => setShowCategoryModal(false);

    const handleSetFilter = (value) => {
        setFilter(value);
    }

    const addProduct = async (value) => {
        if (value) {
            await postProduct(value);
        }
    }

    const editProduct = async (value) => {
        if (value) {
            await patchProduct(prepEditProduct.id, value)
        }
    }

    const restoreProduct = async (value) => {
        if (value) {
            await patchProduct(value.id, {is_archived: false})
        }
    }

    const handlePrepEditProduct = (product) => {
        setPrepEditProduct(product);
        handleShowEditProductModal();
    }

    const handleShowEditProductModal = () => {
        setShowEditProductModal(true);
    }

    const handleCloseEditProductModal = () => {
        setShowEditProductModal(false);
    }

    const categoryOptions = categoryData.map((cat) => { return {key: cat.name, value: cat.id}})

    const listProducts = productData.results.map(product => 
    <>
        <ProductCard 
            product={product} 
            key={product.id} 
            onToggle={handlePrepEditProduct}
            />
    </>
    )

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-row justify-between'>
                <div className='flex items-center'>
                    <Dropdown value={filter} selection='Filter Product' forPageFilter={true} onSelect={setFilter} options={categoryOptions} size='regular' />
                        <div className='mx-1    ' />
                    <Button variant='block2' text='Archives' icon={Archive} onClick={handleShowArchivedModal} />
                </div>
                <div className='flex items-center gap-4'>
                    <Button variant='block2' text='Manage Discounts' icon={Settings} onClick={handleShowDiscountModal}/>
                    <Button variant='block2' text='Manage Categories' icon={Settings} onClick={handleShowCategoryModal} />
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
            <ArchivedModal onRestore={restoreProduct} onClose={handleCloseArchivedModal} />
            }

            {showEditProductModal &&
            <EditProductModal product={prepEditProduct} categoryOptions={categoryOptions} onConfirm={editProduct} onClose={handleCloseEditProductModal} />
            }

            {showDiscountModal &&
            <DiscountModal onClose={handleCloseDiscountModal}/>
            }
            {showCategoryModal &&
            <CategoryModal onClose={handleCloseCategoryModal}/>
            }
        </div>
    )
}

export default Products;