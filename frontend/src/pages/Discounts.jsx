import React, { useState } from 'react';
import { Title, Button, Dropdown } from '../components/atoms';
import { Pagination } from '../components/molecules';
import { Plus, Edit, Trash2 } from 'lucide-react';
import useDiscount from '@/hooks/useDiscount';
import useProduct from '@/hooks/useProduct';
import useCategory from '@/hooks/useCategory';
import { useToast } from '@/context/ToastContext';
import { AddDiscountModal, EditDiscountModal } from '../components/organisms';
import { DiscountsSkeleton } from '@/components/molecules/Skeletons';
import { cn } from '@/utils/cn';
import { useSearchParams } from 'react-router-dom';

const discountTypeOptions = [
    { key: 'Percentage', value: 'percentage' },
    { key: 'Fixed', value: 'fixed' },
];

const discountScopeOptions = [
    { key: 'All Products', value: 'all_products' },
    { key: 'Selected Products', value: 'selected_products' },
    { key: 'Selected Categories', value: 'selected_category' },
];

const discountStatusOptions = [
    { key: 'Active', value: 'true' },
    { key: 'Inactive', value: 'false' },
];

const discountSortOptions = [
    { key: 'Value: Low to High', value: 'value' },
    { key: 'Value: High to Low', value: '-value' },
    { key: 'Usage: Low to High', value: 'used_count' },
    { key: 'Usage: High to Low', value: '-used_count' },
    { key: 'Created: Oldest First', value: 'id' },
    { key: 'Created: Newest First', value: '-id' },
];

const Discounts = () => {
    const { addToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { discountData, discountPagination, discountLoading, discountError, postDiscount, patchDiscount, deleteDiscount } = useDiscount();
    const { allProducts: productData, loading: productLoading } = useProduct();
    const { categoryData, categoryLoading } = useCategory();

    const [showAddModal, setShowAddModal] = useState(false);
    const [prepEditDiscount, setPrepEditDiscount] = useState(null);


    if (discountLoading || productLoading || categoryLoading) return <DiscountsSkeleton />;
    if (discountError) return <h5>Error loading discount data</h5>;

    const selectedType = searchParams.get('discount_type') || null;
    const selectedScope = searchParams.get('scope') || null;
    const selectedStatus = searchParams.get('active') || null;
    const selectedSorting = searchParams.get('ordering') || null;

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
            discount_type: null,
            scope: null,
            active: null,
            ordering: null,
        });
    };

    const clear = () => {
        setShowAddModal(false);
        setPrepEditDiscount(null);
    };

    const handleAddDiscount = async (payload) => {
        try {
            await postDiscount(payload);
            addToast('Discount added successfully', 'success');
            clear();
        } catch {
            addToast('Failed to add discount', 'error');
        }
    };

    const handleEditDiscount = async (payload) => {
        try {
            await patchDiscount(prepEditDiscount.id, payload);
            addToast('Discount updated successfully', 'success');
            clear();
        } catch {
            addToast('Failed to update discount', 'error');
        }
    };

    const toggleStatus = async (discount) => {
        try {
            await patchDiscount(discount.id, { active: !discount.active });
            addToast(`Discount ${discount.active ? 'deactivated' : 'activated'}`, 'success');
        } catch {
            addToast('Failed to update discount status', 'error');
        }
    }

    const handleDeleteDiscount = async (id) => {
        try {
            await deleteDiscount(id);
            addToast('Discount deleted', 'success');
            clear();
        } catch {
            addToast('Failed to delete discount', 'error');
        }
    };

    const productOptions = productData?.map(p => ({ key: p.name, value: p.id })) || [];
    const categoryOptions = categoryData?.map(c => ({ key: c.name, value: c.id })) || [];

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-row justify-between items-center'>
                <Title text="Discounts" />
                <Button variant='block' text='Add Discount' icon={Plus} onClick={() => setShowAddModal(true)} />
            </div>

            <div className='rounded-lg '>
                <div className='flex flex-wrap items-end gap-3'>
                    <div className='min-w-44'>
                        <h5 className='text-xs font-semibold text-text/50 mb-1'>Type</h5>
                        <Dropdown
                            size='full'
                            variant='white'
                            selection='All types'
                            value={selectedType}
                            options={discountTypeOptions}
                            onSelect={(value) => updateQueryParams({ discount_type: value })}
                        />
                    </div>

                    <div className='min-w-52'>
                        <h5 className='text-xs font-semibold text-text/50 mb-1'>Scope</h5>
                        <Dropdown
                            size='full'
                            variant='white'
                            selection='All scopes'
                            value={selectedScope}
                            options={discountScopeOptions}
                            onSelect={(value) => updateQueryParams({ scope: value })}
                        />
                    </div>

                    <div className='min-w-40'>
                        <h5 className='text-xs font-semibold text-text/50 mb-1'>Status</h5>
                        <Dropdown
                            size='full'
                            variant='white'
                            selection='Any status'
                            value={selectedStatus}
                            options={discountStatusOptions}
                            onSelect={(value) => updateQueryParams({ active: value })}
                        />
                    </div>

                    <div className='min-w-56'>
                        <h5 className='text-xs font-semibold text-text/50 mb-1'>Sort By</h5>
                        <Dropdown
                            size='full'
                            variant='white'
                            selection='Default'
                            value={selectedSorting}
                            options={discountSortOptions}
                            onSelect={(value) => updateQueryParams({ ordering: value })}
                        />
                    </div>
                </div>
            </div>

            <div className='flex flex-col h-[75vh] justify-between'>
                {!discountData ? (
                    <div className='flex justify-center items-center h-full'>
                        <h5 className='text-sm font-medium text-text/50'>No discounts to show</h5>
                    </div>
                ) : (
                    <div className='overflow-x-auto w-full'>
                        <div className='p-2 py-3 bg-accent-mute rounded-t-lg flex flex-row items-center text-white text-sm text-center'>
                            <h5 className='flex-1 text-left pl-2'>Name</h5>
                            <h5 className='flex-1 text-left'>Type</h5>
                            <h5 className='flex-1 text-left'>Value</h5>
                            <h5 className='flex-1 text-left'>Scope</h5>
                            <h5 className='flex-1 text-left'>Usage (Used/Limit)</h5>
                            <h5 className='flex-1 text-left'>Status</h5>
                            <h5 className='flex-1 text-left'>Actions</h5>
                        </div>
                        <div className='flex flex-col gap-2 mt-2'>
                            {discountData.map((discount) => (
                                <div
                                    onClick={() => setPrepEditDiscount(discount)}
                                    key={discount.id} className='p-2.5 flex flex-row items-center text-text font-medium text-sm text-center bg-main-white border-b-main-dark border-b-2 border-x border-x-main-dark cursor-pointer transition'>

                                    <div className='flex-1 text-left pl-2'>
                                        <h5>{discount.name}</h5>
                                    </div>

                                    <h5 className='flex-1 text-left capitalize'>
                                        {discount.discount_type}
                                    </h5>

                                    <h5 className='flex-1 text-left'>
                                        {discount.discount_type === 'percentage' ? `${discount.value}%` : `₱${discount.value}`}
                                    </h5>

                                    <h5 className='flex-1 text-left capitalize'>
                                        {discount.scope.replace('_', ' ')}
                                    </h5>

                                    <h5 className='flex-1 text-left'>
                                        {discount.used_count} / {discount.usage_limit || '∞'}
                                    </h5>

                                    <div className='flex-1 text-left flex items-center gap-4'>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${discount.active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                                            {discount.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className='flex-1 flex justify-start'>
                                        <button className={cn('bg-main-dark flex p-1 w-12 rounded-full cursor-pointer border 1.5 border-border', discount.active ? 'bg-success justify-end' : 'justify-start')}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStatus(discount);
                                            }}>
                                            <div className={cn('h-5 w-5 rounded-full bg-white')}>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Pagination prev={discountPagination?.previous} next={discountPagination?.next} />
            </div>

            {showAddModal && (
                <AddDiscountModal
                    productOptions={productOptions}
                    categoryOptions={categoryOptions}
                    onConfirm={handleAddDiscount}
                    onClose={clear}
                />
            )}

            {prepEditDiscount && (
                <EditDiscountModal
                    discount={prepEditDiscount}
                    productOptions={productOptions}
                    categoryOptions={categoryOptions}
                    onConfirm={handleEditDiscount}
                    onClose={clear}
                    onDelete={handleDeleteDiscount}
                />
            )}
        </div>
    );
};

export default Discounts;