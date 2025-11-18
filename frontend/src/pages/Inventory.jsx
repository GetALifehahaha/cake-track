import React, { useState } from 'react';
import { Button, Title } from '../components/atoms';
import { InventoryDashboardCard } from '../components/molecules';
import { EditInventoryItem, InventoryAddItem } from '../components/organisms';
import { Plus, CheckCircle2, XCircle, CircleAlert, Clock9, CircleQuestionMark, Ellipsis, ChevronLeft, ChevronRight } from 'lucide-react';

const Inventory = () => {

    const [pageNum, setPageNum] = useState(1);
    const dummyData = [
        {id: 1, name: "Flour", amount: 30, unit: "kg", purchaseDate: "January 28, 2025", expirationDate: "January 30, 2025", status: "Good"},
    ]

    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([...dummyData]);
    const [prepEditItem, setPrepEditItem] = useState(null)

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
        setShowAddItemModal(!showAddItemModal)
    }

    const handleShowEditItemModal = () => {
        setShowEditItemModal(!showEditItemModal)
    }
    console.table(inventoryItems)
    const handleAddItem = (value) => {
        if (value && value.name) {
            setInventoryItems([...inventoryItems, {id: inventoryItems.length+1, ...value}])
            setShowAddItemModal(false)
        }
    }

    const handlePrepEditItem = (value) => {
        setPrepEditItem(value);
        handleShowEditItemModal();
    }

    const handleEditItem = (value) => {
        const updatedItem = inventoryItems.map((item, index) => item.id === value.id ? value : item)
        setInventoryItems(updatedItem);
        handlePrepEditItem(null);
        handleShowEditItemModal();
    }

    const handleDeleteItem = (id) => {
        setInventoryItems(items => items.filter((item) => item.id != id))
        handlePrepEditItem(null);
        handleShowEditItemModal();
    }

    const listDummyData = inventoryItems.map((item, index) => 
        <div key={index} className='p-2 flex flex-row items-center text-text font-medium text-md text-center border-b-border border-b'>
            <h5 className='basis-1/6'>{item.name}</h5>
            <h5 className='basis-1/6'>{item.amount} {item.unit}</h5>
            <h5 className='basis-1/6'>{item.purchaseDate}</h5>
            <h5 className='basis-1/6'>{item.expirationDate}</h5>
            <h5 className='basis-1/6'>{item.status}</h5>
            <h5 className='basis-1/6'><Ellipsis size={18} className='mx-auto cursor-pointer' onClick={() => handlePrepEditItem(item)} /></h5>
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
                        <Button variant='block' size='small' text='Add Item' icon={Plus} onClick={handleShowAddItemModal} />
                    </div>
                </div>
                
                {/* Table */}
                <div className='mt-2 flex flex-col min-h-120'>
                    <div className='p-2 bg-accent-mute rounded-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='basis-1/6'>Item Name</h5>
                        <h5 className='basis-1/6'>Amount</h5>
                        <h5 className='basis-1/6'>Purchase Date</h5>
                        <h5 className='basis-1/6'>Expiration</h5>
                        <h5 className='basis-1/6'>Status</h5>
                        <h5 className='basis-1/6'>Action</h5>
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
                <InventoryAddItem onConfirm={handleAddItem} onClose={handleShowAddItemModal} />
            }

            {showEditItemModal &&
                <EditInventoryItem item={prepEditItem} onDelete={handleDeleteItem} onConfirm={handleEditItem} onClose={handleShowEditItemModal} />
            }
        </div>
    )
}

export default Inventory;