import React, { useMemo, useState } from 'react';
import { Button, Label, Title } from '../../atoms';
import { X } from 'lucide-react';

const formatPrice = (value) =>
    Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const PendingOrdersModal = ({
    pendingTransactions = [],
    onClose,
    onComplete,
    completingOrderId = null,
}) => {
    const [searchValue, setSearchValue] = useState('');

    const sortedTransactions = useMemo(() => {
        return [...pendingTransactions].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
    }, [pendingTransactions]);

    const normalizedSearch = searchValue.trim().toLowerCase();

    const visibleTransactions = useMemo(() => {
        if (!normalizedSearch) {
            return sortedTransactions;
        }

        return sortedTransactions.filter((transaction) => {
            const orderNumber = String(transaction.order_number ?? '').toLowerCase();
            const transactionId = String(transaction.id ?? '').toLowerCase();
            const customerName = String(transaction.customer_name ?? '').trim().toLowerCase();

            return orderNumber.includes(normalizedSearch)
                || transactionId.includes(normalizedSearch)
                || customerName.includes(normalizedSearch);
        });
    }, [normalizedSearch, sortedTransactions]);

    return (
        <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-20'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[45vw] max-w-[90vw] max-h-[85vh] flex flex-col gap-6'>
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='Pending Orders' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose} />
                </div>

                <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    type='text'
                    placeholder='Search by order number or customer name'
                    className='w-full rounded-lg border border-border bg-main-white px-3 py-2 text-sm text-text outline-none focus:border-accent'
                />

                <div className='overflow-y-auto flex flex-col gap-3 pr-1'>
                    {visibleTransactions.length === 0 && (
                        <div className='py-16 flex justify-center'>
                            <h5 className='text-text/60 font-medium'>
                                {sortedTransactions.length === 0
                                    ? 'No pending orders found.'
                                    : 'No matching pending orders found.'}
                            </h5>
                        </div>
                    )}

                    {visibleTransactions.map((transaction) => {
                        const customerName = transaction.customer_name?.trim() || 'Walk-in Customer';
                        const items = transaction.transaction_items || [];
                        const isCompleting = completingOrderId === transaction.id;

                        return (
                            <div key={transaction.id} className='border border-border rounded-xl p-4 flex flex-col gap-3'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex flex-col gap-0.5'>
                                        <h5 className='font-bold text-text'>Order #{transaction.order_number ?? '-'}</h5>
                                        <h5 className='text-text/70 text-sm'>Customer: {customerName}</h5>
                                    </div>
                                    <Button
                                        variant='modalBlock'
                                        size='small'
                                        text={isCompleting ? 'Completing...' : 'Complete Order'}
                                        onClick={() => {
                                            if (isCompleting) return;
                                            onComplete(transaction.id);
                                        }}
                                        className={isCompleting ? 'opacity-60 pointer-events-none' : ''}
                                    />
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <Label variant='small' text='Products' />
                                    {items.length === 0 ? (
                                        <h5 className='text-text/50 text-sm'>No items in this order.</h5>
                                    ) : (
                                        <div className='flex flex-col gap-1'>
                                            {items.map((item, index) => (
                                                <div key={`${transaction.id}-${index}`} className='bg-main/70 rounded-lg px-3 py-2'>
                                                    <h5 className='text-text text-sm font-medium'>
                                                        {item.product?.name || 'Unknown Product'}
                                                    </h5>
                                                    <h5 className='text-text/70 text-xs'>
                                                        {item.product_variant?.label || 'No Variant'} • ₱ {formatPrice(item.product_variant?.price)}
                                                    </h5>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PendingOrdersModal;
