import React, { useState } from 'react';
import { InventoryDashboardCard } from '../components/molecules';
import { Button, Title } from '../components/atoms';
import { Plus, CheckCircle2, XCircle, CircleAlert, Clock9, CircleQuestionMark, Ellipsis, ChevronLeft, ChevronRight } from 'lucide-react';

const Inventory = () => {

    const [pageNum, setPageNum] = useState(1);

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

    const dummyData = [
        {name: "Flour", amount: 30, unit: "kg", purchaseDate: "January 28, 2025", expirationData: "January 30, 2025", status: "Good"},
    ]

    const listDummyData = dummyData.map((item, index) => 
        <div key={index} className='p-2 flex flex-row items-center text-text font-medium text-md text-center border-b-border border-b'>
            <h5 className='basis-1/6'>{item.name}</h5>
            <h5 className='basis-1/6'>{item.amount} {item.unit}</h5>
            <h5 className='basis-1/6'>{item.purchaseDate}</h5>
            <h5 className='basis-1/6'>{item.expirationData}</h5>
            <h5 className='basis-1/6'>{item.status}</h5>
            <h5 className='basis-1/6'><Ellipsis size={18} className='mx-auto' /></h5>
        </div>
    )

    return (
        <div className='flex-1 flex p-2 gap-4 w-full h-full flex-col'>
            <div className='h-fit w-full flex justify-between'>
                <InventoryDashboardCard title='IN STOCK' subtitle='AVAILABLE' icon={CheckCircle2} variant='success'/>
                <InventoryDashboardCard title='OUT OF STOCK' subtitle='URGENT' icon={XCircle} variant='error'/>
                <InventoryDashboardCard title='RUNNING LOW' subtitle='WARNING' icon={CircleAlert} variant='warning'/>
                <InventoryDashboardCard title='EXPIRED' subtitle='REVIEW' icon={Clock9} variant='none'/>
                <InventoryDashboardCard title='MISSING' subtitle='LOST' icon={CircleQuestionMark} variant='missing'/>
            </div>
            
            <div className='border-accent-mute border rounded-lg p-4'>
                {/* Header */}
                <div className="flex flex-row justify-between items-center">
                    <Title variant='block' text='Inventory Overview'/>

                    <div className='flex flex-row items-center gap-2'>
                        <Button variant='block' size='small' text='Add Item' icon={Plus} onClick={() => alert("Add button clicked")} />
                    </div>
                </div>
                
                {/* Table */}
                <div className='mt-2 flex flex-col'>
                    <div className='p-2 bg-accent-mute rounded-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='basis-1/6'>Item Name</h5>
                        <h5 className='basis-1/6'>Amount</h5>
                        <h5 className='basis-1/6'>Purchase Date</h5>
                        <h5 className='basis-1/6'>Expiration</h5>
                        <h5 className='basis-1/6'>Status</h5>
                        <h5 className='basis-1/6'>Action</h5>
                    </div>
                    
                    {listDummyData}

                    <div className='flex flex-row items-center gap-2 mt-4 mx-auto'>
                        <button onClick={() => handleSetPageNum("prev")} className='p-2 rounded-sm bg-main-dark'>
                            <ChevronLeft size={18}/>
                        </button>
                        <span className='rounded-sm bg-main-dark aspect-square w-6 flex justify-center items-center'>
                            <h5>
                                {pageNum}
                            </h5>
                        </span>
                        <button onClick={() => handleSetPageNum("next")} className='p-2 rounded-sm bg-main-dark'>
                            <ChevronRight size={18}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Inventory;