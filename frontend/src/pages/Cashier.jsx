import React, { useState } from 'react';
import { Button, Title } from '../components/atoms';
import { AddCashierModal, EditCashierModal } from '../components/organisms';
import { Plus, Ellipsis, ChevronLeft, ChevronRight } from 'lucide-react';

const Cashier = () => {

    const [pageNum, setPageNum] = useState(1);
    const dummyData = [
        {id: 1, fullName: "Adrian Agraviador", contactNumber: "09789129840", address: "Nether Portal", emailAddress: "agraviador@gmail.com"}
    ]

    const [showAddCashierModal, setShowAddCashierModal] = useState(false);
    const [showEditCashierModal, setShowEditCashierModal] = useState(false);
    const [cashiers, setCashiers] = useState([...dummyData]);
    const [prepCashier, setPrepCashier] = useState(null)

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

    const handleShowAddCashierModal = () => {
        setShowAddCashierModal(!showAddCashierModal)
    }

    const handleShowEditCashierModal = () => {
        setShowEditCashierModal(!showEditCashierModal)
    }

    const handleAddCashier = (value) => {
        if (value) {
            setCashiers([...cashiers, value])
            setShowAddCashierModal(false)
        }
    }

    const handlePrepEditCashier = (value) => {
        setPrepCashier(value);
        handleShowEditCashierModal();
    }

    const handleEditCashier = (value) => {
        const updatedCashiers = cashiers.map((item, index) => item.id === value.id ? value : recipe)
        setCashiers(updatedCashiers);
        handlePrepEditCashier(null);
        handleShowEditCashierModal();
    }

    const handleDeleteCashiers = (id) => {
        setCashiers(items => items.filter((item) => item.id != id))
        handlePrepEditCashier(null);
        handleShowEditCashierModal();
    }

    const listCashiers = cashiers.map((cashier, index) => 
        <div key={index} className='p-2 flex flex-row cashiers-center text-text font-medium text-md text-center border-b-border border-b'>
            <h5 className='basis-1/5'>{cashier.fullName}</h5>
            <h5 className='basis-1/5'>{cashier.contactNumber}</h5>
            <h5 className='basis-1/5'>{cashier.address}</h5>
            <h5 className='basis-1/5'>{cashier.emailAddress}</h5>
            <h5 className='basis-1/5'><Ellipsis size={18} className='mx-auto cursor-pointer' onClick={() => handlePrepEditCashier(cashier)} /></h5>
        </div>
    )

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
            <div className='border-accent-mute border rounded-lg p-4'>
                {/* Header */}
                <div className="flex flex-row justify-between items-center">
                    <Title variant='block' text='Cashiers'/>

                    <div className='flex flex-row items-center gap-2'>
                        <Button variant='block' size='small' text='Add Cashier' icon={Plus} onClick={handleShowAddCashierModal} />
                    </div>
                </div>
                
                {/* Table */}
                <div className='mt-2 flex flex-col min-h-120'>
                    <div className='p-2 bg-accent-mute rounded-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='basis-1/5'>Full Name</h5>
                        <h5 className='basis-1/5'>Contact Number</h5>
                        <h5 className='basis-1/5'>Address</h5>
                        <h5 className='basis-1/5'>Email Address</h5>
                        <h5 className='basis-1/5'>Action</h5>
                    </div>
                    
                    {listCashiers}

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

            {showAddCashierModal && 
                <AddCashierModal onConfirm={handleAddCashier} onClose={handleShowAddCashierModal} />
            }

            {showEditCashierModal &&
                <EditCashierModal cashier={prepCashier} onDelete={handleDeleteCashiers} onConfirm={handleEditCashier} onClose={handleShowEditCashierModal} />
            }
        </div>
    )
}

export default Cashier;