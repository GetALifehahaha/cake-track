import React, { useState } from 'react';
import { Title } from '../../components/atoms';
import useOrder from '@/hooks/useOrders';
import { formatDateForDisplay } from '@/utils/date';
import { capitalize } from '@/utils/capitalize';
import Loading from '@/components/molecules/Loading';
import { Pagination } from '@/components/molecules';
import { OrderDetails } from '@/components/organisms';

const QueueRefunded = () => {
    const { data, loading } = useOrder();
    const [orderDetails, setOrderDetails] = useState(null);

    if (loading) return <Loading />;

    const refundedTransactions = data.results || [];

    const listRefundedTransactions = refundedTransactions.map((item, index) => (
        <div
            className='flex w-full text-sm py-2 border-b-2 border-b-main-dark items-center cursor-pointer hover:bg-main/40'
            key={index}
            onClick={() => setOrderDetails(item)}
        >
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{item.id}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{item.full_name}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{capitalize(item.cake_orders.base_flavor)}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{capitalize(item.cake_orders.occasion)}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{item.refund_reference_number || 'N/A'}</h5>
            <h5 className='text-text font-medium text-center py-0.5 flex-1'>{formatDateForDisplay(item.updated_at || item.created_at)}</h5>
        </div>
    ));

    return (
        <div className='w-full p-4 border-border border-2 rounded-xl'>
            <div className='pb-4'>
                <Title variant='block' text='Refunded Transactions' />
            </div>
            <div className='flex flex-row items-center bg-accent-mute rounded-t-xl'>
                <h5 className='text-white font-medium text-center py-2 flex-1'>ID</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Name</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Cake Flavor</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Cake Occasion</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Refund Reference</h5>
                <h5 className='text-white font-medium text-center py-2 flex-1'>Refunded At</h5>
            </div>
            <div className='flex flex-col items-center gap-2 py-2 min-h-100'>
                {listRefundedTransactions}

                <span className='mt-auto'>
                    <Pagination prev={data.previous} next={data.next} count={data?.count} />
                </span>
            </div>

            {orderDetails && (
                <OrderDetails orderDetails={orderDetails} onClose={() => setOrderDetails(null)} />
            )}
        </div>
    );
};

export default QueueRefunded;
