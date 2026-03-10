import React, { useEffect, useRef } from 'react';
import { Title, Label, Button } from '../../atoms';
import { CheckCircle, X, LucidePrinter, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const PaymentSuccessModal = ({ totalAmount, amountReceived, onClose, transactionData, businessData }) => {

    const contentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: contentRef,
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

                <div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Total Amount:' />
                        <h5>₱ {Number(totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Amount Received:' />
                        <h5>₱ {Number(amountReceived).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                    </div>
                </div>

                <div className='text-success flex flex-row items-center justify-between'>
                    <h5 className='font-medium text-md'>Change:</h5>
                    <h5>₱ {Number(amountReceived - totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                </div>

                <div className='flex gap-4'>
                    <Button variant='modalOutline' size='full' icon={LucidePrinter} text='Print receipt' onClick={handlePrint} />
                    <Button variant='modalBlock' size='full' text='Finish' onClick={onClose} />
                </div>
            </div>

            <div style={{ display: "none" }}>
                <div ref={contentRef} id="receipt" className="bg-white text-black">
                    <style>{`
                        @media print {
                            /* 1. Set size to 58mm */
                            @page { size: 58mm auto; margin: 0; }
                            body { margin: 0; padding: 0; }
                            
                            /* 2. Force the receipt to exactly 58mm width */
                            #receipt { 
                                width: 58mm; 
                                margin: 0; 
                                padding: 0; /* Minimal padding for 58mm */
                            }

                            /* 3. Global font adjustments for legibility on small paper */
                            #receipt * {
                                font-family: 'Courier New', Courier, monospace;
                                font-size: 11px; /* Base size */
                                line-height: 1.2;
                            }
                            
                            /* 4. Hide scrollbars */
                            .overflow-y-auto { overflow: visible !important; max-height: none !important; }
                        }
                    `}</style>
                    
                    {/* Container: Width 58mm, small padding, small text */}
                    <div className='w-[58mm] p-1 flex flex-col justify-between'>

                        <h5 className="text-center font-bold text-sm mb-1 uppercase leading-tight">
                            {businessData?.business_name || "Michelle's Cakes and Cafe"}
                        </h5>

                        <div className="text-center text-[10px] mb-2 border-b border-black pb-2 leading-tight">
                            <div className="mb-1">{businessData?.address || ''}</div>
                            <div>TIN: {businessData?.tin || ''}</div>
                        </div>

                        <div className="font-medium text-[10px] mb-2 leading-tight">
                            <div>Cashier: {transactionData?.cashier?.first_name}</div>
                            <div>Mode: {transactionData?.order_type === "dine-in" ? 'DINE IN' : 'TAKE OUT'}</div>
                        </div>

                        <div className="flex justify-between text-[10px] mb-2">
                            <span>{new Date(transactionData?.created_at).toLocaleDateString()}</span>
                            <span>{new Date(transactionData?.created_at).toLocaleTimeString()}</span>
                        </div>

                        {/* Table: Compact Layout */}
                        <table className="w-full text-[10px] mb-2">
                            <thead>
                                <tr className="border-b border-black border-dashed">
                                    <th className="text-left w-6">Qty</th>
                                    <th className="text-left">Item</th>
                                    <th className="text-right">Amt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionData?.transaction_items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="align-top py-1 text-center">{item.quantity}</td>
                                        {/* break-words ensures long cake names don't push the price off paper */}
                                        <td className="align-top py-1 pr-1 leading-tight">
                                            {item.product.name}
                                        </td>
                                        <td className="align-top py-1 text-right whitespace-nowrap">
                                            {Number(item.subtotal || item.price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="text-[10px] space-y-1 mb-2 border-t border-dashed border-black pt-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{Number(transactionData?.gross_total).toFixed(2)}</span>
                            </div>
                            
                            {transactionData?.discount_id && (
                                <div className="flex justify-between">
                                    <span>Disc ({transactionData.discount?.name}):</span>
                                    <span>-{Number(transactionData.gross_total - transactionData.net_total).toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <span>VAT (12%):</span>
                                <span>{Number(transactionData?.gross_total * 0.12).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between font-bold text-xs pt-1 mt-1 border-t border-black">
                                <span>Total:</span>
                                <span>{Number(transactionData?.net_total).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between pt-1">
                                <span>Cash:</span>
                                <span>{Number(transactionData?.paid_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Change:</span>
                                <span>{Number(transactionData?.change || (transactionData?.paid_amount - transactionData?.net_total)).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center text-[10px] space-y-1 mb-2 mt-2">
                            <div>System-Generated Receipt</div>
                            {businessData?.contact_number && <div>{businessData.contact_number}</div>}
                            {businessData?.message && <div className="font-bold">{businessData.message}</div>}
                        </div>

                        <div className="text-center text-[9px] italic opacity-70">
                            Not an official receipt
                        </div>
                    </div>
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