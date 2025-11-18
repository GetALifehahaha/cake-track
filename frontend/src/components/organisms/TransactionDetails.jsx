import React from 'react';
import { Title } from '../atoms';
import { X } from 'lucide-react';

const TransactionDetails = ({transactionDetail, onClose}) => {

    return (
         <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[40vw] flex flex-col gap-4'>
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='View Order Details' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                </div>

                <div className='text-text font-semibold text-sm border-t border-t-border border-b border-b-border py-8'>
                    {transactionDetail.orderItems.map((item, index) => <h5 key={index}>{item.amount}x {item.name}</h5>)}
                </div>

                <div className='flex flex-row'>
                    <div className='flex-1 flex flex-col gap-4'>
                        <h5>Time Ordered: <strong>{transactionDetail.time}</strong></h5>
                        <h5>Cashier: <strong>{transactionDetail.cashier}</strong></h5>
                    </div>
                    <div className='flex-1 flex flex-col gap-4'>
                        <h5>Receipt ID: <strong>{transactionDetail.id}</strong></h5>
                        <h5>Total: <strong>P {transactionDetail.total}</strong></h5>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionDetails;