import React, { useRef } from 'react';
import { Title, Label, Button } from '../../atoms';
import { CheckCircle, X, Download, LucidePrinter } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ReceiptPaper from '@/components/molecules/ReceiptPaper';
import { buildReceiptViewModel, formatMoney } from '@/utils/receipt';

const PaymentSuccessModal = ({ totalAmount, amountReceived, onClose, transactionData, businessData }) => {

    const contentRef = useRef(null);
    const receiptData = buildReceiptViewModel({
        transaction: transactionData,
        business: businessData,
        fallbackTotal: totalAmount,
        fallbackPaid: amountReceived,
    });

    const handlePrint = useReactToPrint({
        // react-to-print expects a function that returns the node to print
        content: () => contentRef.current,
        documentTitle: `Receipt-${transactionData?.id || 'new'}`,
    });

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-1000'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex flex-row gap-2 items-center'>
                        <CheckCircle className='text-success' />
                        <Title variant='modal' text='Payment Successful' />
                    </div>
                    <X size={16} className='text-text cursor-pointer' onClick={onClose} />
                </div>

                <div className='text-success flex flex-col gap-2 items-center justify-center'>
                    <CheckCircle size={64} />
                    <h5>Payment Completed!</h5>
                </div>

                {transactionData?.order_number && (
                    <div className='flex flex-row items-center justify-center'>
                        <h5 className='text-accent-dark font-semibold text-lg'>Order #{transactionData.order_number}</h5>
                    </div>
                )}

                <div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Total Amount:' />
                        <h5>₱ {formatMoney(receiptData.netTotal)}</h5>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Amount Received:' />
                        <h5>₱ {formatMoney(receiptData.paidAmount)}</h5>
                    </div>
                </div>

                <div className='text-success flex flex-row items-center justify-between'>
                    <h5 className='font-medium text-md'>Change:</h5>
                    <h5>₱ {formatMoney(receiptData.changeAmount)}</h5>
                </div>

                <div className='flex gap-4'>
                    <Button variant='modalOutline' size='full' icon={LucidePrinter} text='Print receipt' onClick={handlePrint} />
                    <Button variant='modalBlock' size='full' text='Finish' onClick={onClose} />
                </div>
            </div>

            <div style={{ display: "none" }}>
                <div ref={contentRef} id="receipt" className="bg-white text-black p-3">
                    <ReceiptPaper receipt={receiptData} />
                </div>
            </div>

        </div>
    )
}

export default PaymentSuccessModal;

{/* 
                    <div className='absolute top-0 -right-2 translate-x-full p-2 w-fit flex-col bg-main-white rounded-md shadow-md shadow-black/25 flex justify-between items-center gap-4'>
                        <Button text='' variant='modalOutline' size='fit' icon={X} onClick={onClose} />
                        <Button text='' variant='modalOutline' size='fit' icon={LucidePrinter} />
                        <Button text='' variant='modalBlock' size='fit' icon={Download} />
                    </div> */}