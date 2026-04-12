import React from 'react';
import Loading from '@/components/molecules/Loading';
import usePayments from '@/hooks/usePayments';
import { formatDateForDisplay } from '@/utils/date';
import { Title } from '@/components/atoms';
import { Pagination } from '@/components/molecules';

const QueueHistory = () => {
    const { data, loading, error } = usePayments();
    const paymentResults = data?.results || [];

    if (loading) return <Loading />;
    if (error) return <h5>Error loading payment history</h5>;

    const listHistory = paymentResults.map((payment, index) => (
        <div className='flex w-full text-sm py-2 border-b border-b-main-dark items-center' key={payment.id || index}>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{payment.order_id}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1 capitalize'>{payment.payment_type?.replace('_', ' ')}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>₱ {Number(payment.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1 capitalize'>{payment.status}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{formatDateForDisplay(payment.created_at)}</h5>
        </div>
    ));

    return (
        <div className='w-full p-4 border-border border-2 rounded-xl'>
            <div className='pb-4'>
				<Title variant='block' text='Payment History' />
			</div>

            <div className='flex flex-row items-center bg-accent-mute rounded-t-xl'>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Order ID</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Payment Type</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Amount</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Status</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Paid At</h5>
            </div>

            <div className='flex flex-col items-center gap-2 py-2 min-h-100'>
                {listHistory.length > 0 ? listHistory : (
                    <div className='flex w-full h-full justify-center items-center py-10'>
                        <h5 className='text-accent-text/75 font-semibold'>No payment history yet</h5>
                    </div>
                )}
            </div>

            <Pagination next={data?.next} prev={data?.previous} count={data?.count} pageSize={20} />
        </div>
    );
};

export default QueueHistory;
