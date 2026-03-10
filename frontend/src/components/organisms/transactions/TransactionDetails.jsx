import React, { useState, useRef } from 'react';
import { Button } from '../../atoms';
import { Download, Printer, X, LayoutList, ReceiptText } from 'lucide-react';
import { formatToDecimal } from '@/utils/formatToDecimal';
import useBusinessDetails from '@/hooks/useBusinessDetails';
import Loading from '@/components/molecules/Loading';
import { useReactToPrint } from 'react-to-print';

const TransactionDetails = ({ transactionDetail, onClose }) => {
    const { data, loading, error } = useBusinessDetails();
    const [isReceiptView, setIsReceiptView] = useState(!transactionDetail.is_void);
    const printRef = useRef(null);

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
    if (error) return <h5>Error</h5>;

    const renderReceiptView = () => (
        <div className='max-h-[80vh] overflow-y-auto mx-auto p-6 text-sm w-md flex flex-col justify-between'>
            <h5 className="text-center text-text font-bold text-lg mb-2 ">
                {data.business_name}
            </h5>

            <div className="text-center text-text/50 text-sm mb-4 space-y-0.5 border-b border-b-main-dark pb-8">
                <h5>{data.address}</h5>
                <h5>TIN: {data.tin}</h5>
                <h5>Permit No: ATP-2025-56789</h5>
            </div>

            <div className="text-text font-medium text-sm mb-2 space-y-0.5">
                <h5>Cashier: {transactionDetail.cashier.first_name} {transactionDetail.cashier.last_name} </h5>
                <h5>Serving Mode: {transactionDetail.order_type === "dine-in" ? 'DINE IN' : 'TAKE OUT'}</h5>
            </div>

            <div className="flex text-text text-sm mb-4">
                <h5 className='text-text/50'>Date & Time:</h5>
                <h5 className='ml-auto mr-4'>{new Date(transactionDetail.created_at).toLocaleDateString()}</h5>
                <h5>{new Date(transactionDetail.created_at).toLocaleTimeString()}</h5>
            </div>

            <table className="w-full text-text text-sm mb-4 ">
                <thead>
                    <tr className="border-b border-text/20">
                        <th className="text-left py-1 font-semibold">Quantity</th>
                        <th className="text-left py-1 font-semibold">Name</th>
                        <th className="text-right py-1 font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactionDetail.transaction_items.map((item, index) =>
                        <tr key={index}>
                            <td className="py-2 text-center">{item.quantity}</td>
                            <td className="py-2">{item.product.name} - {item.product_variant.label}</td>
                            <td className="text-right py-2">{(item.product_variant.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="text-sm space-y-1 mb-4">
                {transactionDetail.discount &&
                    <div className="flex justify-between text-text/50">
                        <h5>Discount:</h5>
                        <h5>{transactionDetail.discount.name}: {transactionDetail.discount.rate * 100}%</h5>
                    </div>
                }
                <div className="flex justify-between font-bold text-base pt-1 text-text">
                    <h5>Total:</h5>
                    <h5>₱ {formatToDecimal(transactionDetail.net_total)}</h5>
                </div>
            </div>

            <div className="text-center text-text text-sm space-y-1 mb-3">
                <h5>System-Generated Receipt</h5>
                <h5>Contact us: {data.contact_number}</h5>
                <h5>{data.message}</h5>
            </div>

            <h5 className="text-center text-text text-sm italic">
                This is not an official receipt
            </h5>
        </div>
    );

    const renderCleanView = () => (
        <div className='max-h-[80vh] overflow-y-auto mx-auto p-8 w-[800px] flex flex-col'>
            <div className="flex justify-between items-start border-b border-border pb-6 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-text mb-1">Transaction #{transactionDetail.display_id || transactionDetail.id}</h2>
                    <p className="text-text/50 font-medium">{new Date(transactionDetail.created_at).toLocaleString()}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-md text-sm font-bold tracking-wider ${transactionDetail.is_void ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                    {transactionDetail.is_void ? 'VOIDED' : 'SUCCESS'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 bg-black/5 p-4 rounded-lg">
                <div>
                    <p className="text-text/50 text-xs uppercase tracking-wider mb-1">Cashier</p>
                    <p className="font-semibold text-text">{transactionDetail.cashier.first_name} {transactionDetail.cashier.last_name}</p>
                </div>
                <div>
                    <p className="text-text/50 text-xs uppercase tracking-wider mb-1">Serving Mode</p>
                    <p className="font-semibold text-text uppercase">{transactionDetail.order_type.replace('-', ' ')}</p>
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
                    {transactionDetail.transaction_items.map((item, index) => (
                        <tr key={index} className="text-text">
                            <td className="p-3">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-xs text-text/50">{item.product_variant.label}</p>
                            </td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">₱ {formatToDecimal(item.product_variant.price)}</td>
                            <td className="p-3 text-right font-medium">₱ {formatToDecimal(item.product_variant.price * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mt-auto">
                <div className="w-1/2 md:w-1/3 space-y-2 text-sm text-text">
                    {transactionDetail.discount && (
                        <div className="flex justify-between">
                            <span className="text-text/50">Discount ({transactionDetail.discount.name})</span>
                            <span className="text-error">- {transactionDetail.discount.rate * 100}%</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-xl pt-4 border-t border-border mt-2">
                        <span>Net Total</span>
                        <span className="text-accent-dark">₱ {formatToDecimal(transactionDetail.net_total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const showReceiptView = isReceiptView && !transactionDetail.is_void;

    return (
        <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex flex-col justify-center items-center z-10'>
            <div className={`relative bg-main-white shadow-sm transition-all duration-300 rounded-lg ${showReceiptView ? 'w-md' : 'w-[800px]'}`}>
                
                <div ref={printRef}>
                    {showReceiptView ? renderReceiptView() : renderCleanView()}
                </div>

                <div className='absolute top-0 -right-2 translate-x-full p-2 w-fit flex-col bg-main-white rounded-md shadow-md shadow-black/25 flex justify-between items-center gap-4'>
                    <Button text='' variant='modalOutline' size='fit' icon={X} onClick={onClose} />
                    {!transactionDetail.is_void && (
                        <Button 
                            text='' 
                            variant='modalOutline' 
                            size='fit' 
                            icon={isReceiptView ? LayoutList : ReceiptText} 
                            onClick={() => setIsReceiptView(!isReceiptView)} 
                        />
                    )}
                    <Button text='' variant='modalOutline' size='fit' icon={Printer} onClick={handlePrint} />
                    <Button text='' variant='modalBlock' size='fit' icon={Download} onClick={handleDownload} />
                </div>
            </div>
        </div>
    );
}

export default TransactionDetails;