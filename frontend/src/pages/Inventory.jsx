import React, { useEffect, useState } from 'react';
import { Button, StockLabel, Title } from '../components/atoms';
import { InventoryDashboardCard, Pagination } from '../components/molecules';
import { EditInventoryItem, InventoryAddItem, InventoryInOut, UnitModal } from '../components/organisms';
import { Plus, CheckCircle2, XCircle, CircleAlert, Clock9, ChevronLeft, ChevronRight, ChevronDown, EllipsisVertical, Box } from 'lucide-react';
import useIngredient from '@/hooks/useIngredient';
import Loading from '@/components/molecules/Loading';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/cn';

const Inventory = () => {

    const { addToast } = useToast();
    const { ingredientData, ingredientLoading, ingredientError, postIngredient, refresh, ingredientDashboard } = useIngredient();
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [prepEditItem, setPrepEditItem] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showInOut, setShowInOut] = useState(false);
    const [showUnitsModal, setShowUnitsModal] = useState(false);

    if (ingredientLoading) return <Loading />
    if (ingredientError) return <h5>Error</h5>

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
            refresh();
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

    const handleEditItem = (value) => {

        handlePrepEditItem(null);
        handleShowEditItemModal();
    }

    const handleDeleteItem = (id) => {
        handlePrepEditItem(null);
        handleShowEditItemModal();
    }

    const handleSetActiveIndex = (index) => {
        if (index == activeIndex) { setActiveIndex(null); return; }
        setActiveIndex(index)
    }

    const handleSetShowInOut = () => setShowInOut(true);
    const handleSetCloseInOut = () => { setShowInOut(false); refresh() }
    const toggleUnitsModal = () => setShowUnitsModal(!showUnitsModal)

    const listIngredientData = ingredientData.results.map((item, index) =>
        <div className='flex flex-col gap-2' key={index}>
            <div className='p-2.5 flex flex-row items-center text-text font-medium text-md text-center bg-main-white border-b-main-dark border-b-2 cursor-pointer border-x border-x-main-dark' onClick={() => handleSetActiveIndex(index)}>
                <div className='w-1/25'><ChevronDown size={18} className={`cursor-pointer duration-75 ease-in ${index == activeIndex ? 'rotate-180' : 'rotate-0'}`}  /></div>
                <div className='flex-1 text-left flex gap-2'>
                    <h5 >{item.name}</h5>
                </div>
                <h5 className='flex-1 text-left'>{(item.total_stock).replace(/\.00$/, '')} {item.unit}</h5>
                <div className='flex-1 text-left'><StockLabel amount={item.total_stock} /></div>
                <div className='w-1/25' onClick={(e) => handlePrepEditItem(item, e)}><EllipsisVertical size={18} /></div>
            </div>
            {index == activeIndex &&
                <div className='border-b border-border border-x border-x-border'>
                    <div className='p-2 px-12 flex flex-col'>
                        <h5 className='text-sm font-medium text-text/50 mb-4'>Batch Details</h5>

                        {/* <h5 className='flex-1'>Remaining Amount</h5>
                        <h5 className='flex-1'>Expiration Date</h5> */}
                        {item.batches.map((batch, batchIndex) =>
                            <div key={batchIndex} className={cn('p-4 flex flex-row text-text bg-white rounded-lg border-border border', new Date(batch.expiration_date) <= Date.now() && 'border-error-border bg-error-fill')}>
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
                                    <h5 className={cn('text-text', new Date(batch.expiration_date) <= Date.now() && 'text-error')}>{new Date(batch.expiration_date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h5>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            }
        </div>
    )

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
            <div className='h-fit w-full flex gap-4'>
                <InventoryDashboardCard title='IN STOCK' subtitle='AVAILABLE' icon={CheckCircle2} variant='success' amount={ingredientDashboard.data.summary.in_stock_count} />
                <InventoryDashboardCard title='OUT OF STOCK' subtitle='URGENT' icon={XCircle} variant='error' amount={ingredientDashboard.data.summary.out_of_stock_count} />
                <InventoryDashboardCard title='RUNNING LOW' subtitle='WARNING' icon={CircleAlert} variant='warning' amount={ingredientDashboard.data.summary.running_low_count} />
                <InventoryDashboardCard title='EXPIRED' subtitle='REVIEW' icon={Clock9} variant='none' amount={ingredientDashboard.data.summary.expired_count} />
            </div>

            <div className=''>
                {/* Header */}
                <div className="flex flex-row justify-between items-center">
                    <Title variant='block' text='Inventory Overview' />

                    <div className='flex flex-row items-center gap-2'>
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
                <EditInventoryItem item={prepEditItem} onDelete={handleDeleteItem} onConfirm={handleEditItem} onClose={() => handlePrepEditItem(null)} />
            }

            {showInOut &&
                <InventoryInOut onClose={handleSetCloseInOut} />
            }

            {showUnitsModal &&
                <UnitModal onClose={toggleUnitsModal} />
            }
        </div>
    )
}

export default Inventory;