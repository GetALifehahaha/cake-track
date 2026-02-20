import React, { useState } from 'react';
import { ModalBody, Pagination } from '../../molecules';
import Loading from '@/components/molecules/Loading';
import { Button } from '../../atoms';
import useInventoryTransaction from '@/hooks/useInventoryTransaction'; // Assuming this hook fetches transactions
import { cn } from '@/utils/cn';

const TransactionHistoryModal = ({ onClose }) => {
    const { inventoryTransactionData: transactions, inventoryTransactionLoading: loading, inventoryTransactionError: error } = useInventoryTransaction();

    if (loading) return <Loading />;
    if (error) return <div className='p-6 text-error'>Failed to load transaction history.</div>;

    return (
        <ModalBody title='Transaction History' onClose={onClose} className='w-[80vw] h-[80vh]'>
            <div className='flex flex-col flex-1 gap-2'>
                <div className='flex-1 p-6 overflow-auto max-h-[50vh]'>
                    <div className='p-2 py-3 bg-accent-mute rounded-t-lg flex flex-row items-center text-white text-sm text-center'>
                        <h5 className='flex-1 text-left px-2 font-semibold'>Date</h5>
                        <h5 className='flex-1 text-left px-2 font-semibold'>Ingredient</h5>
                        <h5 className='flex-1 text-left px-2 font-semibold'>Type</h5>
                        <h5 className='flex-1 text-left px-2 font-semibold'>Amount</h5>
                        <h5 className='flex-1 text-left px-2 font-semibold'>Remaining</h5>
                        <h5 className='flex-1 text-left px-2 font-semibold'>Expiry Date</h5>
                    </div>
                    <div className='flex-col gap-2 '>
                        {transactions?.results?.map((tx) => (
                            <div key={tx.id} className='flex flex-row border-b border-b-border items-center hover:-translate-x-1 transition'>
                                <h5 className='flex-1 px-2 py-3 text-left text-sm'>
                                    {tx.purchase_date || 'N/A'}
                                </h5>
                                <h5 className='flex-1 px-2 py-3 text-left text-sm font-semibold'>
                                    {tx.ingredient_name}
                                </h5>
                                <h5 className='flex-1 px-2 py-3 text-left text-sm'>
                                    <span className={cn(
                                        'px-2 py-1 rounded text-[10px] font-bold uppercase',
                                        tx.transaction_type === 'in' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                    )}>
                                        {tx.transaction_type}
                                    </span>
                                </h5>
                                <h5 className='flex-1 px-2 py-3 text-left text-sm'>
                                    {tx.amount} {tx.unit_abbreviation}
                                </h5>
                                <h5 className='flex-1 px-2 py-3 text-left text-sm text-text/60'>
                                    {tx.remaining_amount}
                                </h5>
                                <h5 className='flex-1 px-2 py-3 text-left text-sm text-error font-medium'>
                                    {tx.expiration_date || '-'}
                                </h5>
                            </div>
                        ))}
                    </div>
                </div>

                <Pagination next={transactions.next} prev={transactions.prev} />
            </div>
            <div className='flex justify-end px-6 py-4 border-t border-border/50 bg-gray-50'>
                <Button variant='modalOutline' text='Close' onClick={onClose} />
            </div>
        </ModalBody>
    );
};

export default TransactionHistoryModal;