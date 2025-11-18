import React from 'react';
import { Title, Label, Button } from '../atoms';
import { CheckCircle, X, LucidePrinter } from 'lucide-react';

const PaymentSuccessModal = ({totalAmount, amountReceived, onClose}) => {

    console.log(totalAmount)

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-1000'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex flex-row gap-2 items-center'>
                        <CheckCircle className='text-success' />
                        <Title variant='modal' text='Payment Successful' />
                    </div>
                    <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                </div>

                <div className='text-success flex flex-col gap-2 items-center justify-center'>
                    <CheckCircle size={64} />
                    <h5>Payment Completed!</h5>
                </div>

                <div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Total Amount:'/>
                        <h5>₱ {Number(totalAmount).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Amount Received:'/>
                        <h5>₱ {Number(amountReceived).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                    </div>
                </div>

                <div className='text-success flex flex-row items-center justify-between'>
                    <h5 className='font-medium text-md'>Change:</h5>
                    <h5>₱ {Number(totalAmount - amountReceived).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h5>
                </div>

                <div className='flex gap-4'>
                    <Button variant='modalOutline' size='full' icon={LucidePrinter} text='Print receipt' onClick={() => console.log("Print hehe")}/>
                    <Button variant='modalBlock' size='full' text='Finish' onClick={onClose}/>
                </div>
            </div>
        </div>
    )
}

export default PaymentSuccessModal;