import React, { useState } from 'react';
import { Title, Button } from '../components/atoms';
import { Pagination } from '../components/molecules';
import { Plus, Edit, Trash2 } from 'lucide-react';
import useDiscount from '@/hooks/useDiscount';
import useProduct from '@/hooks/useProduct';
import useCategory from '@/hooks/useCategory';
import { useToast } from '@/context/ToastContext';
import { AddDiscountModal, EditDiscountModal } from '../components/organisms';
import Loading from '@/components/molecules/Loading';

const Discounts = () => {
    const { addToast } = useToast();
    const { discountData, discountLoading, discountError, postDiscount, patchDiscount, deleteDiscount } = useDiscount();
    const { data: productData, loading: productLoading } = useProduct();
    const { categoryData, categoryLoading } = useCategory();

    const [showAddModal, setShowAddModal] = useState(false);
    const [prepEditDiscount, setPrepEditDiscount] = useState(null);

    if (discountLoading || productLoading || categoryLoading) return <Loading />;
    if (discountError) return <h5>Error loading discount data</h5>;

    const clear = () => {
        setShowAddModal(false);
        setPrepEditDiscount(null);
    };

    const handleAddDiscount = async (payload) => {
        try {
            await postDiscount(payload);
            addToast('Discount added successfully', 'success');
            clear();
        } catch (error) {
            addToast('Failed to add discount', 'error');
        }
    };

    const handleEditDiscount = async (payload) => {
        try {
            await patchDiscount(prepEditDiscount.id, payload);
            addToast('Discount updated successfully', 'success');
            clear();
        } catch (error) {
            addToast('Failed to update discount', 'error');
        }
    };

    const handleDeleteDiscount = async (id) => {
        if(window.confirm("Are you sure you want to delete this discount?")) {
            try {
                await deleteDiscount(id);
                addToast('Discount deleted', 'success');
            } catch (error) {
                addToast('Failed to delete discount', 'error');
            }
        }
    };

    const productOptions = productData?.results?.map(p => ({ key: p.name, value: p.id })) || [];
    const categoryOptions = categoryData?.map(c => ({ key: c.name, value: c.id })) || [];

    return (
        <div className='flex flex-col gap-8'>
            <div className='flex flex-row justify-between items-center'>
                <Title text="Discounts" />
                <Button variant='block' text='Add Discount' icon={Plus} onClick={() => setShowAddModal(true)} />
            </div>

            <div className='flex flex-col h-[75vh] justify-between'>
                {!discountData ? (
                    <div className='flex justify-center items-center h-full'>
                        <h5 className='text-sm font-medium text-text/50'>No discounts to show</h5>
                    </div>
                ) : (
                    <div className='overflow-x-auto w-full'>
                        <table className='w-full text-left border-collapse'>
                            <div className='p-2 py-3 bg-accent-mute rounded-t-lg flex flex-row items-center text-white text-sm text-center'>
								<h5 className='flex-1 text-left pl-2'>Name</h5>
								<h5 className='flex-1 text-left'>Type</h5>
								<h5 className='flex-1 text-left'>Value</h5>
								<h5 className='flex-1 text-left'>Scope</h5>
								<h5 className='flex-1 text-left'>Usage (Used/Limit)</h5>
								<h5 className='flex-1 text-left'>Status</h5>
							</div>
                            <div className='flex flex-col gap-2 mt-2'>
								{discountData.map((discount) => (
									<div 
									onClick={() => setPrepEditDiscount(discount)}
									key={discount.id} className='p-2.5 flex flex-row items-center text-text font-medium text-sm text-center bg-main-white border-b-main-dark border-b-2 border-x border-x-main-dark cursor-pointer hover:-translate-y-1 transition'>
										
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
										
										<div className='flex-1 text-left flex items-center'>
											<span className={`px-2 py-1 rounded-full text-xs font-semibold ${discount.active ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
												{discount.active ? 'Active' : 'Inactive'}
											</span>
										</div>
									</div>
								))}
							</div>
                        </table>
                    </div>
                )}
                
                {/* <Pagination prev={discountData?.previous} next={discountData?.next} /> */}
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
                />
            )}
        </div>
    );
};

export default Discounts;