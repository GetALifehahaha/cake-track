import React, { useState, useRef } from 'react';
import { Button } from '../../atoms';
import { Download, Printer, X, LayoutList, ReceiptText } from 'lucide-react';
import { formatToDecimal } from '@/utils/formatToDecimal';
import useBusinessDetails from '@/hooks/useBusinessDetails';
import Loading from '@/components/molecules/Loading';
import { ModalErrorState } from '@/components/molecules';
import { useReactToPrint } from 'react-to-print';

const TransactionDetails = ({ transactionDetail, onClose }) => {
    const { data, loading, error } = useBusinessDetails();
    const [isReceiptView, setIsReceiptView] = useState(!transactionDetail?.is_void);
    const printRef = useRef(null);

    const toAmount = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const formatMoney = (value, fallback = 0) =>
        toAmount(value, fallback).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const createdAt = transactionDetail?.created_at ? new Date(transactionDetail.created_at) : null;
    const hasValidDate = createdAt && !Number.isNaN(createdAt.getTime());

    const grossTotal = toAmount(transactionDetail?.gross_total, 0);
    const netTotal = toAmount(transactionDetail?.net_total, 0);
    const paidAmount = toAmount(transactionDetail?.paid_amount, 0);
    const vatAmount = grossTotal * 0.12;
    const changeAmount = toAmount(transactionDetail?.change, paidAmount - netTotal);
    const transactionId = transactionDetail?.display_id || transactionDetail?.id || 'N/A';

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Transaction-${transactionDetail?.display_id || transactionDetail?.id}`,
    });

    const handleDownload = () => {
        // Use the browser print dialog with "Save as PDF" destination
        const printWindow = window.open('', '_blank');
        if (!printWindow || !printRef.current) return;

        const content = printRef.current.innerHTML;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Transaction-${transactionDetail?.display_id || transactionDetail?.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px 4px; text-align: left; }
                        th { border-bottom: 1px solid #ccc; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .border-t { border-top: 1px solid #ccc; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    if (loading) return <Loading />;
    if (error) return <ModalErrorState onClose={onClose} title='Failed to load transaction details' details='Unable to load required business details for this transaction.' />;

    const renderReceiptView = () => (
        <div className='max-h-[80vh] overflow-y-auto mx-auto p-6 text-sm w-md flex flex-col justify-between' style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            
            {/* Header */}
            <h5 className="text-center text-text font-bold text-lg mb-0.5 uppercase leading-tight">
                {data?.business_name || "MY BUSINESS"}
            </h5>
            <div className="text-center text-text/50 text-xs leading-tight">
                <div>{data?.address || ''}</div>
                <div>TIN: {data?.tin || ''}</div>
            </div>

            {/* Separator */}
            <div className="text-text/30 text-center text-xs my-2" style={{ letterSpacing: '1px' }}>{'='.repeat(40)}</div>

            {/* Date & Time */}
            <div className="flex justify-between text-text text-xs mb-2">
                <span>{hasValidDate ? createdAt.toLocaleDateString() : 'N/A'}</span>
                <span>{hasValidDate ? createdAt.toLocaleTimeString() : 'N/A'}</span>
            </div>

            {/* Items Header */}
            <div className="text-xs text-text font-semibold flex justify-between border-b border-dashed border-text/30 pb-1 mb-1">
                <span className="w-8">Qty</span>
                <span className="flex-1 pl-1">Item</span>
                <span className="text-right">Amt</span>
            </div>

            {/* Items */}
            {transactionDetail?.transaction_items?.map((item, index) =>
                <div key={index} className="text-xs text-text flex justify-between leading-tight py-1">
                    <span className="w-8 text-center">{toAmount(item?.quantity, 0)}</span>
                    <span className="flex-1 pl-1 pr-2">{item?.product?.name || item?.name || 'Item'}</span>
                    <span className="text-right whitespace-nowrap">{formatMoney(toAmount(item?.product_variant?.price, toAmount(item?.price, 0)) * toAmount(item?.quantity, 0))}</span>
                </div>
            )}

            {/* Dashed separator */}
            <div className="text-text/30 text-center text-xs my-2" style={{ letterSpacing: '1px' }}>{'- '.repeat(20)}</div>

            {/* Totals */}
            <div className="text-xs text-text/70 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatMoney(grossTotal)}</span>
                </div>
                {transactionDetail?.discount && (
                    <div className="flex justify-between">
                        <span>Disc ({transactionDetail?.discount?.name || 'Discount'}):</span>
                        <span>-{formatMoney(grossTotal - netTotal)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>VAT (12%):</span>
                    <span>{formatMoney(vatAmount)}</span>
                </div>
            </div>

            {/* Total line separator */}
            <div className="border-t border-text/30 my-2"></div>

            <div className="text-xs space-y-1">
                <div className="flex justify-between font-bold text-text text-sm">
                    <span>Total:</span>
                    <span>{formatMoney(netTotal)}</span>
                </div>
                <div className="flex justify-between text-text/80">
                    <span>Cash:</span>
                    <span>{formatMoney(paidAmount)}</span>
                </div>
                <div className="flex justify-between text-text/80">
                    <span>Change:</span>
                    <span>{formatMoney(changeAmount)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-text text-xs mt-4 space-y-0.5">
                <div>System-Generated Receipt</div>
                <div>{data?.contact_number || ''}</div>
                {data?.message && <div className="font-bold">{data.message}</div>}
            </div>

            <div className="text-center text-text/50 text-xs italic mt-2">Not an official receipt</div>
        </div>
    );

    const renderCleanView = () => (
        <div className='max-h-[80vh] overflow-y-auto mx-auto p-8 w-[800px] flex flex-col'>
            <div className="flex justify-between items-start border-b border-border pb-6 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-text mb-1">Transaction #{transactionDetail?.display_id || transactionDetail?.id}</h2>
                    <p className="text-text/50 font-medium">{transactionDetail?.created_at ? new Date(transactionDetail.created_at).toLocaleString() : ''}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-md text-sm font-bold tracking-wider ${transactionDetail?.is_void ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                    {transactionDetail?.is_void ? 'VOIDED' : 'SUCCESS'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 bg-black/5 p-4 rounded-lg">
                <div>
                    <p className="text-text/50 text-xs uppercase tracking-wider mb-1">Cashier</p>
                    <p className="font-semibold text-text">{transactionDetail?.cashier?.first_name} {transactionDetail?.cashier?.last_name}</p>
                </div>
                <div>
                    <p className="text-text/50 text-xs uppercase tracking-wider mb-1">Serving Mode</p>
                    <p className="font-semibold text-text uppercase">{transactionDetail?.order_type?.replace('-', ' ')}</p>
                </div>
            </div>

            <table className="w-full text-left border-collapse mb-8">
                <thead className="bg-main-dark/5 text-text/70 text-sm">
                    <tr>
                        <th className="p-3 rounded-tl-md font-semibold">Item Details</th>
                        <th className="p-3 font-semibold text-center">Qty</th>
                        <th className="p-3 font-semibold text-right">Unit Price</th>
                        <th className="p-3 text-right rounded-tr-md font-semibold">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {transactionDetail?.transaction_items?.map((item, index) => (
                        <tr key={index} className="text-text">
                            <td className="p-3">
                                <p className="font-medium">{item.product?.name}</p>
                                <p className="text-xs text-text/50">{item.product_variant?.label}</p>
                            </td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">₱ {formatToDecimal(item.product_variant?.price)}</td>
                            <td className="p-3 text-right font-medium">₱ {formatToDecimal((item.product_variant?.price ?? 0) * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mt-auto">
                <div className="w-1/2 md:w-1/3 space-y-2 text-sm text-text">
                    {transactionDetail?.discount && (
                        <div className="flex justify-between">
                            <span className="text-text/50">Discount ({transactionDetail.discount?.name})</span>
                            <span className="text-error">- {(transactionDetail.discount?.rate ?? 0) * 100}%</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-xl pt-4 border-t border-border mt-2">
                        <span>Net Total</span>
                        <span className="text-accent-dark">₱ {formatToDecimal(transactionDetail?.net_total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const showReceiptView = isReceiptView && !transactionDetail?.is_void;

    return (
        <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex flex-col justify-center items-center z-10'>
            <div className={`relative bg-main-white shadow-sm transition-all duration-300 rounded-lg ${showReceiptView ? 'w-md' : 'w-[800px]'}`}>
                
                <div ref={printRef}>
                    {showReceiptView ? renderReceiptView() : renderCleanView()}
                </div>

                <div className='absolute top-0 -right-2 translate-x-full p-2 w-fit flex-col bg-main-white rounded-md shadow-md shadow-black/25 flex justify-between items-center gap-4'>
                    <Button text='' variant='modalOutline' size='fit' icon={X} onClick={onClose} />
                    {!transactionDetail?.is_void && (
                        <Button 
                            text='' 
                            variant='modalOutline' 
                            size='fit' 
                            icon={isReceiptView ? LayoutList : ReceiptText} 
                            onClick={() => setIsReceiptView(!isReceiptView)} 
                        />
                    )}
                    {!transactionDetail?.is_void && (
                        <Button text='' variant='modalOutline' size='fit' icon={Printer} onClick={handlePrint} />
                    )}
                    {!transactionDetail?.is_void && (
                        <Button text='' variant='modalBlock' size='fit' icon={Download} onClick={handleDownload} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default TransactionDetails;