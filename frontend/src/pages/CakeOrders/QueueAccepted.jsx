import React, { useState } from 'react'
import { DatePicker, Pagination } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { AcceptedCard, OrderDetails, ConfirmationModal, InputRefundModal } from '../../components/organisms';
import useOrder from '@/hooks/useOrders';
import { useSearchParams } from 'react-router-dom';
import { QueueAcceptedSkeleton } from '@/components/molecules/Skeletons';
import { formatDateForAPI } from '@/utils/date';
import { useToast } from '@/context/ToastContext';

const QueueAccepted = () => {

	const { addToast } = useToast();
	const { data, loading, patchOrder, batchUpdateOrders, refundOrder } = useOrder();
	const [orderDetails, setOrderDetails] = useState(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const currentDateParams = searchParams.get('due_date')
	const selectedDate = currentDateParams ? new Date(currentDateParams) : null
	const [completeId, setCompleteId] = useState(null);
	const [prepCompleteAll, setPrepCompleteAll] = useState(false);
	const [refundTarget, setRefundTarget] = useState(null);
	const hasCancellationFilter = searchParams.get('cancellation_requested') === 'true';
	const hasActiveFilters = Boolean(selectedDate) || hasCancellationFilter;

	const orderItems = Array.isArray(data?.results) ? data.results : [];

	if (loading) return <QueueAcceptedSkeleton />

	const handleSetDateFilter = (date) => {
		const newParams = Object.fromEntries(searchParams.entries());

		if (date) {
			newParams.due_date = formatDateForAPI(date)
		} else {
			delete newParams.due_date
		}

		setSearchParams(newParams)
	}

	const clearAllFilters = () => {
		const newParams = Object.fromEntries(searchParams.entries());
		delete newParams.due_date;
		delete newParams.cancellation_requested;
		delete newParams.page;
		setSearchParams(newParams);
	}

	const completeOrder = async () => {
		if (completeId === null) return;

		try {
			await patchOrder(completeId, { status: "ready" });

			addToast("Order marked as ready for pickup");
			setCompleteId(null);
		} catch {
			addToast("Failed to accept order.", "error")
		}
	}

	const completeAllOrders = async () => {
		const orderIds = orderItems
			.map((order) => String(order?.id || '').trim())
			.filter(Boolean);

		if (orderIds.length === 0) return;

		try {
			const response = await batchUpdateOrders({ order_ids: orderIds, status: 'ready' });
			const updatedCount = Number(response?.updated_count || 0);
			const errorCount = Array.isArray(response?.errors) ? response.errors.length : 0;

			if (updatedCount > 0) {
				addToast(
					updatedCount === 1
						? '1 order marked as ready for pickup'
						: `${updatedCount} orders marked as ready for pickup`,
					'success',
				);
			}

			if (errorCount > 0) {
				addToast(response?.errors?.[0] || 'Some orders could not be updated.', 'error');
			}
		} catch {
			addToast('Failed to update orders.', 'error');
		} finally {
			setPrepCompleteAll(false);
		}
	}

	const handleRefundOrder = async (refundReferenceNumber) => {
		if (!refundTarget?.id) return;

		try {
			await refundOrder(refundTarget.id, { refund_reference_number: refundReferenceNumber });
			addToast('Order refunded successfully');
			setRefundTarget(null);
		} catch {
			addToast('Failed to refund order.', 'error');
		}
	}

	const listOrder = orderItems.map((cake, index) =>
		(
			<AcceptedCard
				key={index}
				order={cake}
				onComplete={() => setCompleteId(cake.id)}
				onShowDetails={setOrderDetails}
				onRefund={setRefundTarget}
			/>
		) || null
	)


	return (
		<div className='flex flex-col min-h-140'>
			<div className='p-2 flex items-center gap-4 py-4 border-b border-main-dark'>
				<span className='w-60'>
					<DatePicker className='bg-white' selected={selectedDate} onSelect={handleSetDateFilter} />
				</span>
				{hasActiveFilters && (
					<Button
						variant='modalOutline'
						size='small'
						text='Clear All'
						onClick={clearAllFilters}
					/>
				)}
				<div className='flex-1' />
				{orderItems.length > 0 && (
					<Button
						variant='modalBlock'
						size='small'
						text='Ready All'
						onClick={() => setPrepCompleteAll(true)}
					/>
				)}
			</div>
			{orderItems.length > 0 ?
				<div className='grid grid-cols-4 gap-4 mt-8 min-h-100'>
					{listOrder}

				</div>
				:
				<div className='flex w-full h-full justify-center items-center flex-1'>
					<h5 className='text-accent-text/75 font-semibold'>No accepted orders</h5>
				</div>
			}
			<Pagination prev={data.previous} next={data.next} count={data?.count} pageSize={8} />


			{orderDetails &&
				<OrderDetails orderDetails={orderDetails} onClose={() => setOrderDetails(null)} />
			}

			{completeId &&
				<ConfirmationModal title={"Ready for Pickup?"} content={"Are you sure you want to mark this order as ready for pickup?"} onConfirm={completeOrder} onReject={() => setCompleteId(null)} />
			}

			{prepCompleteAll &&
				<ConfirmationModal
					title={'Ready All Orders?'}
					content={'Are you sure you want to mark all listed orders as ready for pickup?'}
					onConfirm={completeAllOrders}
					onReject={() => setPrepCompleteAll(false)}
				/>
			}

			{refundTarget &&
				<InputRefundModal
					order={refundTarget}
					onConfirm={handleRefundOrder}
					onReject={() => setRefundTarget(null)}
				/>
			}
		</div>
	)
}

export default QueueAccepted