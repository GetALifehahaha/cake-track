import React, { useState } from 'react';
import { Title, Dropdown, Button } from '../components/atoms';
import { Pagination, ProductCard } from '../components/molecules';
import { Archive, Plus, Settings, Minus } from 'lucide-react';
import { AddProductModal, ArchivedModal, CategoryModal, EditProductModal, ProductsSkeletonLoading } from '../components/organisms';
import useProduct from '@/hooks/useProduct'
import useCategory from '@/hooks/useCategory';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import Loading from '@/components/molecules/Loading';

const productSortOptions = [
    { key: 'Name: A to Z', value: 'name' },
    { key: 'Name: Z to A', value: '-name' },
    { key: 'Created: Oldest First', value: 'created_at' },
    { key: 'Created: Newest First', value: '-created_at' },
];

const Products = () => {
    const { addToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { categoryData, categoryLoading, categoryError } = useCategory();
    const { postProduct, data: productData, patchProduct, loading: productLoading, error: productError, batchUnarchiveProduct } = useProduct();
    const [prepEditProduct, setPrepEditProduct] = useState(null);

    const selectedCategory = searchParams.get('categories__name') || null;
    const selectedOrdering = searchParams.get('ordering') || null;

    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [showArchivedModal, setShowArchivedModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const updateQueryParams = (updates) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
                return;
            }

            params.set(key, value);
        });

        params.set('page', '1');
        setSearchParams(params);
    };

    const clearFiltersAndSorting = () => {
        updateQueryParams({
            categories__name: null,
            ordering: null,
        });
    };

    if (productLoading || categoryLoading) return <ProductsSkeletonLoading />
    if (productError) return <h5>Error loading product data</h5>
    if (categoryError) return <h5>Error loading category data</h5>

    const clear = () => {
        handleCloseAddProductModal();
        handleCloseEditProductModal();
        handleCloseArchivedModal();
        setPrepEditProduct(null)
    }

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

    const handleShowCategoryModal = () => setShowCategoryModal(true);
    const handleCloseCategoryModal = () => setShowCategoryModal(false);

    const addProduct = async (value) => {
        if (value) {
            await postProduct(value);
            addToast('Product added successfully', 'success');
            clear();
        }
    }

    const editProduct = async (value) => {
        if (value) {
            await patchProduct(prepEditProduct.id, value)
            addToast('Product edited successfully', 'success');
            clear();
        }
    }

    const restoreProduct = async (value = []) => {
        if (value.length) {
            await batchUnarchiveProduct({ product_ids: value })
            addToast('Product restored successfully', 'success');
            clear();
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

    const categoryOptions = categoryData.map((cat) => { return { key: cat.name, value: cat.id } })
    const categoryFilterOptions = categoryData.map((cat) => ({ key: cat.name, value: cat.name }));

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
                <div className='flex items-end gap-2'>
                    <div className='w-44'>
                        <h5 className='text-xs font-semibold text-text/50 mb-1'>Category</h5>
                        <Dropdown
                            size='full'
                            variant='block'
                            value={selectedCategory}
                            selection='All categories'
                            onSelect={(value) => updateQueryParams({ categories__name: value })}
                            options={categoryFilterOptions}
                        />
                    </div>

                    <div className='w-56'>
                        <h5 className='text-xs font-semibold text-text/50 mb-1'>Sort By</h5>
                        <Dropdown
                            size='full'
                            variant='white'
                            value={selectedOrdering}
                            selection='Default'
                            onSelect={(value) => updateQueryParams({ ordering: value })}
                            options={productSortOptions}
                        />
                    </div>

                </div>
                <div className='flex items-center gap-4'>
                    <Button variant='block2' text='Archives' icon={Archive} onClick={handleShowArchivedModal} />
                    <Button variant='block2' text='Manage Categories' icon={Settings} onClick={handleShowCategoryModal} />
                    <Button variant='block' text='Add Item' icon={Plus} onClick={handleShowAddProductModal} />
                </div>
            </div>

            <div className='flex flex-col h-[75vh] justify-between'>
                {productData.results.length == 0 ?
                    <div className='flex justify-center items-center h-full'>
                        <h5 className='text-sm font-medium text-text/50'>
                            No products to show
                        </h5>
                    </div>
                    :
                    <div className='overflow-x-auto flex items-center flex-col gap-2'>
                        <div className='grid grid-cols-7 p-2 gap-4 w-full flex-wrap '>
                            {listProducts}
                        </div>
                    </div>
                }

                <Pagination prev={productData.previous} next={productData.next} />
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

            {showCategoryModal &&
                <CategoryModal onClose={handleCloseCategoryModal} />
            }
        </div>
    )
}

export default Products;