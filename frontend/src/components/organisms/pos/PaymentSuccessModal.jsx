import React, { useEffect, useRef } from 'react';
import { Title, Label, Button } from '../../atoms';
import { CheckCircle, X, LucidePrinter } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const PaymentSuccessModal = ({ totalAmount, amountReceived, onClose, transactionData, businessData }) => {

    const contentRef = useRef(null);

    const toAmount = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const formatMoney = (value, fallback = 0) =>
        toAmount(value, fallback).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const createdAt = transactionData?.created_at ? new Date(transactionData.created_at) : null;
    const hasValidDate = createdAt && !Number.isNaN(createdAt.getTime());

    const grossTotal = toAmount(transactionData?.gross_total, toAmount(totalAmount, 0));
    const netTotal = toAmount(transactionData?.net_total, toAmount(totalAmount, 0));
    const paidAmount = toAmount(transactionData?.paid_amount, toAmount(amountReceived, 0));
    const vatAmount = grossTotal * 0.12;
    const changeAmount = toAmount(transactionData?.change, paidAmount - netTotal);
    const transactionId = transactionData?.is_local ? '' : (transactionData?.display_id || transactionData?.id || '');
    const discountName = typeof transactionData?.discount === 'string'
        ? transactionData.discount
        : transactionData?.discount?.name;
    const discountApplied = grossTotal > netTotal;

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

                {transactionData?.order_number && (
                    <div className='flex flex-row items-center justify-center'>
                        <h5 className='text-accent-dark font-semibold text-lg'>Order #{transactionData.order_number}</h5>
                    </div>
                )}

                <div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Total Amount:' />
                        <h5>₱ {formatMoney(netTotal)}</h5>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        <Label variant='modal' text='Amount Received:' />
                        <h5>₱ {formatMoney(paidAmount)}</h5>
                    </div>
                </div>

                <div className='text-success flex flex-row items-center justify-between'>
                    <h5 className='font-medium text-md'>Change:</h5>
                    <h5>₱ {formatMoney(changeAmount)}</h5>
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
                            @page { size: 58mm auto; margin: 0; }
                            body { margin: 0; padding: 0; }
                            #receipt { 
                                width: 58mm; 
                                margin: 0; 
                                padding: 0;
                            }
                            #receipt * {
                                font-family: 'Courier New', Courier, monospace;
                                font-size: 11px;
                                line-height: 1.3;
                            }
                            .overflow-y-auto { overflow: visible !important; max-height: none !important; }
                        }
                    `}</style>
                    
                    <div className='w-[58mm] p-2 flex flex-col' style={{ fontFamily: "'Courier New', Courier, monospace" }}>

                        {/* Header */}
                        <h5 className="text-center font-bold text-sm mb-0.5 uppercase leading-tight">
                            {businessData?.business_name || "Michelle's Cakes and Cafe"}
                        </h5>
                        <div className="text-center text-[10px] leading-tight">
                            <div>{businessData?.address || ''}</div>
                            <div>TIN: {businessData?.tin || ''}</div>
                        </div>

                        {/* Separator */}
                        <div className="text-[10px] text-center my-1" style={{ letterSpacing: '1px' }}>{'='.repeat(32)}</div>

                        {/* Date & Time */}
                        <div className="flex justify-between text-[10px] mb-1">
                            <span>{hasValidDate ? createdAt.toLocaleDateString() : 'N/A'}</span>
                            <span>{hasValidDate ? createdAt.toLocaleTimeString() : 'N/A'}</span>
                        </div>

                        {/* Items Header */}
                        <div className="text-[10px] flex justify-between border-b border-dashed border-black pb-0.5 mb-1">
                            <span className="w-6">Qty</span>
                            <span className="flex-1 pl-1">Item</span>
                            <span className="text-right">Amt</span>
                        </div>

                        {/* Items */}
                        {transactionData?.transaction_items?.map((item, index) => (
                            <div key={index} className="text-[10px] flex justify-between leading-tight py-0.5">
                                <span className="w-6 text-center">{item.quantity}</span>
                                <span className="flex-1 pl-1 pr-1 wrap-break-word leading-tight">
                                    {item.product?.name || item.name || 'Item'}
                                </span>
                                {toAmount(item?.line_total_after, toAmount(item?.line_total_before, -1)) >= 0 ? (
                                    <span className="text-right whitespace-nowrap">
                                        {toAmount(item?.line_total_after, 0) < toAmount(item?.line_total_before, 0) && (
                                            <span className="line-through opacity-60 mr-1">{formatMoney(toAmount(item?.line_total_before, 0))}</span>
                                        )}
                                        <span>{formatMoney(toAmount(item?.line_total_after, 0))}</span>
                                    </span>
                                ) : (
                                    <span className="text-right whitespace-nowrap">
                                        {formatMoney((toAmount(item?.product_variant?.price, toAmount(item?.price, 0))) * toAmount(item?.quantity, 0))}
                                    </span>
                                )}
                            </div>
                        ))}

                        {/* Dashed separator */}
                        <div className="text-[10px] text-center my-1" style={{ letterSpacing: '1px' }}>{'- '.repeat(16)}</div>

                        {/* Totals */}
                        <div className="text-[10px] space-y-0.5">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatMoney(grossTotal)}</span>
                            </div>
                            
                            {discountApplied && (
                                <div className="flex justify-between">
                                    <span>Disc ({discountName || 'Applied'}):</span>
                                    <span>-{formatMoney(grossTotal - netTotal)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <span>VAT (12%):</span>
                                <span>{formatMoney(vatAmount)}</span>
                            </div>
                        </div>

                        {/* Total line separator */}
                        <div className="border-t border-black my-1"></div>

                        <div className="text-[10px] space-y-0.5">
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatMoney(netTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cash:</span>
                                <span>{formatMoney(paidAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Change:</span>
                                <span>{formatMoney(changeAmount)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-[10px] mt-3 space-y-0.5">
                            <div>System-Generated Receipt</div>
                            {businessData?.contact_number && <div>{businessData.contact_number}</div>}
                            {businessData?.message && <div className="font-bold">{businessData.message}</div>}
                        </div>

                        <div className="text-center text-[9px] italic opacity-70 mt-2">
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