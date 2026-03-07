import React, { useEffect, useState } from 'react';
import { Button, StockLabel, Title } from '../components/atoms';
import { InventoryDashboardCard, Pagination } from '../components/molecules';
import { ConfirmationModal, EditInventoryItem, InventoryAddItem, InventoryInOut, TransactionHistoryModal, UnitModal } from '../components/organisms';
import { Plus, CheckCircle2, XCircle, CircleAlert, Clock9, Trash, ChevronRight, ChevronDown, EllipsisVertical, Box } from 'lucide-react';
import useIngredient from '@/hooks/useIngredient';
import Loading from '@/components/molecules/Loading';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/cn';
import { InventorySkeleton } from '@/components/molecules/Skeletons';
import { useSearchParams } from 'react-router-dom';

const Inventory = () => {

    const { addToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const {ingredientData, 
        ingredientDashboard, 
        ingredientError, 
        ingredientLoading, 
        postIngredient, 
        patchIngredient, 
        deleteIngredient, 
        stockOutAllExpiredIngredient} = useIngredient();
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [prepEditItem, setPrepEditItem] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showInOut, setShowInOut] = useState(false);
    const [showUnitsModal, setShowUnitsModal] = useState(false);
    const [showStockOutAllConfirmationModal, setShowStockOutAllConfirmationModal] = useState(false);
    const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);


    if (ingredientLoading) return <InventorySkeleton />
    if (ingredientError) return <h5>Error</h5>
    
    
    const toggleTransactionHistoryModal = () => setShowTransactionHistoryModal(prev => !prev);
    const toggleStockOutAllConfirmationModal = () => setShowStockOutAllConfirmationModal(prev => !prev);

    const handleShowAddItemModal = () => {
        setShowAddItemModal(true)
    }
    const handleCloseAddItemModal = () => {
        setShowAddItemModal(false)
    }

    const handleShowEditItemModal = () => {
        setShowEditItemModal(!showEditItemModal)    
    }
    const handleAddItem = async (value) => {
        try {
            await postIngredient(value);
            handleCloseAddItemModal();
            addToast("New ingredient added successfully")
        } catch (err) {
            addToast("Failed to add new ingredient", "error")
        }

    }

    const handlePrepEditItem = (value, e) => {
        if (e) e.stopPropagation();
        setPrepEditItem(value);
        handleShowEditItemModal();
    }

    const handleEditItem = async (value) => {
        try {
            await patchIngredient(value.id, {...value})
            handlePrepEditItem(null);
            addToast("Ingredient has been edited successfully")
        } catch (err) {
            addToast("Failed to edit ingredient", "error")
        }
    }

    const handleCloseEditItemModal = () => handlePrepEditItem(null)

    const deleteItem = async (id) => {
        try {
            await deleteIngredient(id);
            handlePrepEditItem(null)
            addToast("Ingredient has been deleted successfully!")
        } catch (err) {
            addToast("Failed to delete ingredient", "error")
        }
    }

    const stockOutExpiredIngredients = async () => {
        try {
            await stockOutAllExpiredIngredient();
            addToast("All expired ingredients has been stocked out!")
            toggleStockOutAllConfirmationModal();
        } catch (err) {
            addToast("Failed to stock out expired ingredients", "error")
        }
    }

    const handleSetActiveIndex = (index) => {
        if (index == activeIndex) { setActiveIndex(null); return; }
        setActiveIndex(index)
    }

    const handleSetShowInOut = () => setShowInOut(true);
    const handleSetCloseInOut = () => { setShowInOut(false)}
    const toggleUnitsModal = () => setShowUnitsModal(!showUnitsModal)

    const getBatchStatus = (expirationDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(expirationDate);
        expiry.setHours(0, 0, 0, 0);

        const diffInDays = (expiry - today) / (1000 * 60 * 60 * 24);

        if (diffInDays < 0) return "expired";
        if (diffInDays <= 7) return "near";
        return "normal";
    };

    const setFilter = (filter) => {
        const params = new URLSearchParams(searchParams);

        if (filter == null) params.delete('filter') 
        else params.set('filter', filter);

        setSearchParams(params);
    }


    const listIngredientData = ingredientData.results.map((item, index) =>
        <div className='flex flex-col gap-2' key={index}>
            <div className='p-2.5 flex flex-row items-center text-text font-medium text-md text-center bg-main-white border-b-main-dark border-b-2 cursor-pointer border-x border-x-main-dark' onClick={() => handleSetActiveIndex(index)}>
                <div className='w-1/25'><ChevronDown size={18} className={`cursor-pointer duration-75 ease-in ${index == activeIndex ? 'rotate-180' : 'rotate-0'}`}  /></div>
                <div className='flex-1 text-left flex gap-2'>
                    <h5 >{item.name}</h5>
                </div>
                <h5 className='flex-1 text-left'>{(item.total_stock).replace(/\.00$/, '')} {item.unit.abbreviation}</h5>
                <div className='flex-1 text-left flex items-center'>
                    <StockLabel amount={item.total_stock} />

                    <div className='w-fit flex flex-row gap-2 ml-4'>
                        {item.batches.some(batch => new Date(batch.expiration_date) < Date.now()) && (
                            <Clock9 size={20} className='text-error'/>
                        )}
                        {item.batches.some(batch => {
                            const today = new Date();
                            const exp = new Date(batch.expiration_date);
                            const diffDays = (exp - today) / (1000 * 60 * 60 * 24);
                            return diffDays >= 0 && diffDays <= 7;
                        }) && (
                            <CircleAlert size={20} className='text-warning' />
                        )}
                    </div>
                </div>
                <div className='w-1/25' onClick={(e) => handlePrepEditItem(item, e)}>
                    <EllipsisVertical size={18} />
                </div>
            </div>

            {index == activeIndex &&
                <div className='border-b border-border border-x border-x-border'>
                    <div className='p-2 px-12 flex flex-col gap-2'>
                        <h5 className='text-sm font-medium text-text/50 mb-4'>Batch Details</h5>

                        {item.batches.map((batch, batchIndex) => {
                            const status = getBatchStatus(batch.expiration_date);

                            return (
                                <div
                                    key={batchIndex}
                                    className={cn(
                                        'p-4 flex flex-row rounded-lg border',
                                        status === 'expired' && 'border-error bg-white text-error',
                                        status === 'near' && 'border-warning bg-white text-warning',
                                        status === 'normal' && 'border-border bg-white text-text'
                                    )}
                                >
                                    <div className='flex-1 flex flex-col items-start gap-2'>
                                        <h5 className='text-text/50'>Remaining Amount</h5>
                                        <h5 >{(batch.remaining_amount).replace(/\.00$/, '')}</h5>
                                    </div>
                                    <div className='flex-1 flex flex-col items-start gap-2'>
                                        <h5 className='text-text/50'>Purchase Date</h5>
                                        <h5 className='flex-1'>{new Date(batch.purchase_date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h5>
                                    </div>
                                    <div className='flex-1 flex flex-col items-start gap-2'>
                                        <h5 className='text-text/50'>Expiration Date</h5>
                                        <h5 className={cn(status === 'expired' && 'text-error', status === 'near' && 'text-warning', status === 'normal' && 'text-text' )}>{new Date(batch.expiration_date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h5>
                                    </div>
                                </div>
                                )
                            }
                        )}
                    </div>
                </div>
            }
        </div>
    )

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
            <div className='h-fit w-full flex gap-4'>
                <InventoryDashboardCard 
                    title='IN STOCK' 
                    subtitle='AVAILABLE' 
                    icon={CheckCircle2} 
                    variant='success' 
                    amount={ingredientDashboard.summary.in_stock_count} 
                    onClick={setFilter} 
                    type={'available'}/>
                <InventoryDashboardCard 
                    title='OUT OF STOCK' 
                    subtitle='URGENT' 
                    icon={XCircle} 
                    variant='error'
                    amount={ingredientDashboard.summary.out_of_stock_count} 
                    onClick={setFilter} 
                    type={'out_of_stock'}/>
                <InventoryDashboardCard 
                    title='NEAR EXPIRATION' 
                    subtitle='ATTENTION' 
                    icon={CircleAlert} 
                    variant='warning' 
                    amount={ingredientDashboard.summary.near_expiration_count} 
                    onClick={setFilter} 
                    type={'near_expiration'}/>
                <InventoryDashboardCard 
                    title='EXPIRED' 
                    subtitle='REVIEW' 
                    icon={Clock9} 
                    variant='none' 
                    amount={ingredientDashboard.summary.expired_count} 
                    onClick={setFilter} 
                    type={'expired'}/>
            </div>

            <div className=''>
                {/* Header */}
                <div className="flex flex-row justify-between items-center">
                    <Title variant='block' text='Inventory Overview' />

                    <div className='flex flex-row items-center gap-2'>
                        {ingredientDashboard.summary.expired_count > 0 &&
                            <Button variant='modalOutline' size='small' text='Stock Out Expired Ingredients' icon={Trash} onClick={toggleStockOutAllConfirmationModal} className='shadow-sm' />
                        }
                        <Button variant='modalOutline' size='small' text='Transaction History' icon={Box} onClick={toggleTransactionHistoryModal} className='shadow-sm' />
                        <Button variant='modalOutline' size='small' text='Manage Units' icon={Box} onClick={toggleUnitsModal} className='shadow-sm' />
                        <Button variant='modalOutline' size='small' text='Adjust Stocks' icon={Box} onClick={handleSetShowInOut} className='shadow-sm' />
                        <Button variant='block' size='small' text='Add Item' icon={Plus} onClick={handleShowAddItemModal} className='rounded-md border-accent shadow-sm' />
                    </div>
                </div>

                {/* Table */}
                <div className='mt-2 flex flex-col min-h-120'>
                    <div className='p-2 py-3 bg-accent-mute rounded-t-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='w-1/25'></h5>
                        <h5 className='flex-1 text-left'>Item Name</h5>
                        <h5 className='flex-1 text-left'>Amount</h5>
                        <h5 className='flex-1 text-left'>Status</h5>
                        <h5 className='w-1/25'></h5>
                    </div>

                    {listIngredientData}
                    
                    <div className='mt-2'/>
                    {/* Pagination */}
                    <div className='mt-auto mx-auto'>
                        <Pagination next={ingredientData.next} prev={ingredientData.previous} />
                    </div>
                </div>
            </div>

            {/* Modals */}

            {showAddItemModal &&
                <InventoryAddItem onConfirm={handleAddItem} onClose={handleCloseAddItemModal} />
            }

            {prepEditItem &&
                <EditInventoryItem item={prepEditItem} onDelete={deleteItem} onConfirm={handleEditItem} onClose={handleCloseEditItemModal} />
            }

            {showInOut &&
                <InventoryInOut onClose={handleSetCloseInOut} />
            }

            {showUnitsModal &&
                <UnitModal onClose={toggleUnitsModal} />
            }

            {showTransactionHistoryModal &&
                <TransactionHistoryModal onClose={toggleTransactionHistoryModal} />
            }

            {showStockOutAllConfirmationModal &&
                <ConfirmationModal title="Stock out all expired ingredients" content="Are you sure you want to stock out all expired ingredients?" onConfirm={stockOutExpiredIngredients} onReject={toggleStockOutAllConfirmationModal} />
            }
        </div>
    )
}

export default Inventory;