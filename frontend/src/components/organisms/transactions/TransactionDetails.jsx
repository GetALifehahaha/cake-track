import React, { useState, useRef } from 'react';
import { Button } from '../../atoms';
import { Download, Printer, X, LayoutList, ReceiptText } from 'lucide-react';
import { formatToDecimal } from '@/utils/formatToDecimal';
import useBusinessDetails from '@/hooks/useBusinessDetails';
import Loading from '@/components/molecules/Loading';
import { ModalErrorState } from '@/components/molecules';
import { useReactToPrint } from 'react-to-print';
import ReceiptPaper from '@/components/molecules/ReceiptPaper';
import { buildReceiptPrintHtml, buildReceiptViewModel } from '@/utils/receipt';

const TransactionDetails = ({ transactionDetail, onClose }) => {
    const { data, loading, error } = useBusinessDetails();
    const [isReceiptView, setIsReceiptView] = useState(!transactionDetail?.is_void);
    const receiptRef = useRef(null);

    const toAmount = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const receiptData = buildReceiptViewModel({
        transaction: transactionDetail,
        business: data,
    });

    const grossTotal = toAmount(transactionDetail?.gross_total, receiptData.grossTotal);
    const netTotal = toAmount(transactionDetail?.net_total, receiptData.netTotal);
    const usedDiscountAmount = Math.max(toAmount(transactionDetail?.discount_amount, receiptData.discountAmount), 0);
    const usedDiscountName = transactionDetail?.discount_snapshot?.name || receiptData.discountName || 'Applied';

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Transaction-${transactionDetail?.display_id || transactionDetail?.id}`,
    });

    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = buildReceiptPrintHtml(
            receiptData,
            `Transaction-${transactionDetail?.display_id || transactionDetail?.id}`
        );

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    if (loading) return <Loading />;
    if (error) return <ModalErrorState onClose={onClose} title='Failed to load transaction details' details='Unable to load required business details for this transaction.' />;

    const renderReceiptView = () => (
        <div className='max-h-[80vh] overflow-y-auto mx-auto p-4 w-full'>
            <ReceiptPaper receipt={receiptData} />
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
                    <p className="font-semibold text-text">{receiptData.cashierName}</p>
                </div>
                <div>
                    <p className="text-text/50 text-xs uppercase tracking-wider mb-1">Serving Mode</p>
                    <p className="font-semibold text-text uppercase">{receiptData.orderType.replace('-', ' ')}</p>
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
                    {usedDiscountAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-text/50">Discount ({usedDiscountName})</span>
                            <span className="text-error">-₱ {formatToDecimal(usedDiscountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-xl pt-4 border-t border-border mt-2">
                        <span>Net Total</span>
                        <span className="text-accent-dark">₱ {formatToDecimal(netTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const showReceiptView = isReceiptView && !transactionDetail?.is_void;

    return (
        <div className='absolute top-0 left-0 w-full bg-black/5 backdrop-blur-xs h-screen flex flex-col justify-center items-center z-10'>
            <div className={`relative bg-main-white shadow-sm transition-all duration-300 rounded-lg ${showReceiptView ? 'w-[380px]' : 'w-[800px]'}`}>

                <div>
                    {showReceiptView ? renderReceiptView() : renderCleanView()}
                </div>

                <div className='hidden'>
                    <div ref={receiptRef} id='receipt'>
                        <ReceiptPaper receipt={receiptData} />
                    </div>
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