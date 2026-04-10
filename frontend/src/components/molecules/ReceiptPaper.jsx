import React from 'react';
import { formatMoney } from '@/utils/receipt';

const ReceiptPaper = ({ receipt }) => {
    return (
        <div className='receipt-paper w-[360px] max-w-full mx-auto p-4 border border-border rounded-lg bg-main-white text-text font-mono'>
            <h5 className='text-center text-sm font-bold uppercase leading-tight'>{receipt.businessName}</h5>
            <div className='text-center text-[11px] text-text/70 leading-tight'>{receipt.businessAddress}</div>
            <div className='text-center text-[11px] text-text/70 leading-tight'>TIN: {receipt.businessTin}</div>

            <div className='border-t border-dashed border-text/40 my-2'></div>

            <div className='print-section text-[11px] space-y-0.5'>
                <div className='flex justify-between'>
                    <span>Receipt #</span>
                    <span>{receipt.displayId}</span>
                </div>
                {receipt.orderNumber && (
                    <div className='flex justify-between'>
                        <span>Order #</span>
                        <span>{receipt.orderNumber}</span>
                    </div>
                )}
                <div className='flex justify-between'>
                    <span>Date</span>
                    <span>{receipt.date}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Time</span>
                    <span>{receipt.time}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Cashier</span>
                    <span>{receipt.cashierName}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Order Type</span>
                    <span className='capitalize'>{String(receipt.orderType || '').replace('-', ' ')}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Payment</span>
                    <span className='uppercase'>{receipt.paymentMethod}</span>
                </div>
                {receipt.customerName && (
                    <div className='flex justify-between'>
                        <span>Customer</span>
                        <span>{receipt.customerName}</span>
                    </div>
                )}
            </div>

            <div className='border-t border-dashed border-text/40 my-2'></div>

            <div className='print-section text-[11px]'>
                <div className='grid grid-cols-[32px_1fr_90px] pb-1 border-b border-dashed border-text/40 font-semibold'>
                    <span className='text-center'>Qty</span>
                    <span>Item</span>
                    <span className='text-right'>Amount</span>
                </div>

                <div className='space-y-1 pt-1'>
                    {receipt.items.map((item, index) => (
                        <div key={`${item.productName}-${index}`} className='grid grid-cols-[32px_1fr_90px] gap-1'>
                            <span className='text-center'>{item.quantity}</span>
                            <div className='leading-tight'>
                                <div>{item.productName}</div>
                                {item.variantLabel && (
                                    <div className='text-[10px] text-text/60'>{item.variantLabel}</div>
                                )}
                            </div>
                            <div className='text-right whitespace-nowrap'>
                                {item.lineAfter < item.lineBefore && (
                                    <span className='line-through text-text/50 mr-1'>{formatMoney(item.lineBefore)}</span>
                                )}
                                <span>{formatMoney(item.lineAfter)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='border-t border-dashed border-text/40 my-2'></div>

            <div className='print-section text-[11px] space-y-0.5'>
                <div className='flex justify-between'>
                    <span>Subtotal</span>
                    <span>{formatMoney(receipt.grossTotal)}</span>
                </div>
                {receipt.discountAmount > 0 && (
                    <div className='flex justify-between'>
                        <span>Discount ({receipt.discountName || 'Applied'})</span>
                        <span>-{formatMoney(receipt.discountAmount)}</span>
                    </div>
                )}
                <div className='flex justify-between'>
                    <span>VAT (12%)</span>
                    <span>{formatMoney(receipt.vatAmount)}</span>
                </div>

                <div className='border-t border-text/50 my-1'></div>

                <div className='flex justify-between text-sm font-bold'>
                    <span>Total</span>
                    <span>{formatMoney(receipt.netTotal)}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Cash</span>
                    <span>{formatMoney(receipt.paidAmount)}</span>
                </div>
                <div className='flex justify-between'>
                    <span>Change</span>
                    <span>{formatMoney(receipt.changeAmount)}</span>
                </div>
            </div>

            <div className='print-section footer text-center text-[10px] mt-3 text-text/80 leading-tight'>
                <div>System-Generated Receipt</div>
                {receipt.businessContact && <div>{receipt.businessContact}</div>}
                {receipt.businessMessage && <div className='font-bold'>{receipt.businessMessage}</div>}
                <div>Not an official receipt</div>
            </div>
        </div>
    );
};

export default ReceiptPaper;
