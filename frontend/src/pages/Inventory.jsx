import React, { useEffect, useState } from 'react';
import { Button, Title } from '../components/atoms';
import { InventoryDashboardCard } from '../components/molecules';
import { EditInventoryItem, InventoryAddItem, InventoryInOut } from '../components/organisms';
import { Plus, CheckCircle2, XCircle, CircleAlert, Clock9, CircleQuestionMark, Ellipsis, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import useIngredient from '@/hooks/useIngredient';

const Inventory = () => {

    const [pageNum, setPageNum] = useState(1);
    const {ingredientData, ingredientLoading, ingredientError, postIngredient, fetchIngredients, ingredientResponse} = useIngredient();
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [prepEditItem, setPrepEditItem] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showInOut, setShowInOut] = useState(false);

    useEffect(() => {   
        fetchIngredients();
    }, [ingredientResponse])

    if (ingredientLoading) return <h5>Loading</h5>
    if (ingredientError) return <h5>Error</h5>

    const handleSetPageNum = (direction) => {
        if (direction == "prev") {
            if (pageNum - 1 == 0) {
                return;
            }

            setPageNum(p => p-1);
        } else if (direction == "next") {
            setPageNum(p => p+1)
        }
    }

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
        await postIngredient(value);
        handleCloseAddItemModal();
    }

    const handlePrepEditItem = (value) => {
        setPrepEditItem(value);
        handleShowEditItemModal();
    }

    const handleEditItem = (value) => {
        // const updatedItem = inventoryItems.map((item, index) => item.id === value.id ? value : item)
        // setInventoryItems(updatedItem);
        handlePrepEditItem(null);
        handleShowEditItemModal();
    }

    const handleDeleteItem = (id) => {
        // setInventoryItems(items => items.filter((item) => item.id != id))
        handlePrepEditItem(null);
        handleShowEditItemModal();
    }

    const handleSetActiveIndex = (index) => {
        if (index == activeIndex) {setActiveIndex(null); return;}
        setActiveIndex(index)
    }

    const handleSetShowInOut = () => setShowInOut(true);
    const handleSetCloseInOut = () => setShowInOut(false);

    const listDummyData = ingredientData.results.map((item, index) => 
        <div className='flex flex-col gap-2' key={index}>
            <div  className='p-2 flex flex-row items-center text-text font-medium text-md text-center border-b-main-dark border-b-2'>
                <h5 className='flex-1'>{item.name}</h5>
                <h5 className='flex-1'>{(item.total_stock).replace(/\.00$/, '')} {item.unit}</h5>
                {/* <h5 className='flex-1'>{}</h5> */}
                {/* <h5 className='basis-1/6'>{item.purchaseDate}</h5> */}
                {/* <h5 className='basis-1/6'>{item.expirationDate}</h5> */}
                {/* <h5 className='basis-1/6'>{item.status}</h5> */}
                <h5 className='flex-1'><ChevronDown size={18} className={`mx-auto cursor-pointer duration-75 ease-in ${index == activeIndex ? 'rotate-180' : 'rotate-0'}`} onClick={() => handleSetActiveIndex(index)} /></h5>
            </div>
            {   index == activeIndex &&
                <div className='border-b border-border'>
                    <div className=' p-0.5 flex flex-row items-center text-text/50 font-semibold text-xs text-center border-b-border/50 border-b'>
                        <h5 className='flex-1'>Remaining Amount</h5>
                        <h5 className='flex-1'>Purchase Date</h5>
                        <h5 className='flex-1'>Expiration Date</h5>
                    </div>

                    {item.batches.map((batch, batchIndex) => 
                    <div key={batchIndex} className='p-2 flex flex-row items-center text-text font-medium text-md text-center border-b-border/50 border-b bg-main-white'>
                            <h5 className='flex-1'>{(batch.remaining_amount).replace(/\.00$/, ''    )}</h5>
                            <h5 className='flex-1'>{new Date(batch.purchase_date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h5>
                            <h5 className='flex-1'>{new Date(batch.expiration_date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h5>
                    </div>)}
            </div>
            }
        </div>
    )

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
            <div className='h-fit w-full flex gap-4'>
                <InventoryDashboardCard title='IN STOCK' subtitle='AVAILABLE' icon={CheckCircle2} variant='success' amount={1}/>
                <InventoryDashboardCard title='OUT OF STOCK' subtitle='URGENT' icon={XCircle} variant='error' amount={0}/>
                <InventoryDashboardCard title='RUNNING LOW' subtitle='WARNING' icon={CircleAlert} variant='warning' amount={1}/>
                <InventoryDashboardCard title='EXPIRED' subtitle='REVIEW' icon={Clock9} variant='none' amount={0}/>
            </div>
            
            <div className='border-accent-mute border rounded-lg p-4'>
                {/* Header */}
                <div className="flex flex-row justify-between items-center">
                    <Title variant='block' text='Inventory Overview'/>

                    <div className='flex flex-row items-center gap-2'>
                        <Button variant='block' size='small' text='Adjust Stocks' icon={Plus} onClick={handleSetShowInOut} />
                        <Button variant='block' size='small' text='Add Item' icon={Plus} onClick={handleShowAddItemModal} />
                    </div>
                </div>
                
                {/* Table */}
                <div className='mt-2 flex flex-col min-h-120'>
                    <div className='p-2 bg-accent-mute rounded-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='flex-1'>Item Name</h5>
                        <h5 className='flex-1'>Amount</h5>
                        {/* <h5 className='basis-1/6'>Purchase Date</h5> */}
                        {/* <h5 className='basis-1/6'>Expiration</h5> */}
                        <h5 className='flex-1'>Status</h5>
                        <h5 className='flex-1'>Action</h5>
                    </div>
                    
                    {listDummyData}

                    {/* Pagination */}
                    <div className='flex flex-row items-center gap-2 mt-auto mx-auto'>
                        <button onClick={() => handleSetPageNum("prev")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
                            <ChevronLeft size={18}/>
                        </button>
                        <span className='rounded-sm bg-main-dark aspect-square w-6 flex justify-center items-center'>
                            <h5>
                                {pageNum}
                            </h5>
                        </span>
                        <button onClick={() => handleSetPageNum("next")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
                            <ChevronRight size={18}/>
                        </button>
                    </div>

                </div>
            </div>

            {/* Modals */}

            {showAddItemModal && 
                <InventoryAddItem onConfirm={handleAddItem} onClose={handleCloseAddItemModal} />
            }

            {showEditItemModal &&
                <EditInventoryItem item={prepEditItem} onDelete={handleDeleteItem} onConfirm={handleEditItem} onClose={handleShowEditItemModal} />
            }

            {showInOut &&
                <InventoryInOut onClose={handleSetCloseInOut} />
            }
        </div>
    )
}

export default Inventory;