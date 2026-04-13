import React, { useState } from 'react'
import { DatePicker, Pagination } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { ReadyCard, OrderDetails, CompletePaymentModal, ConfirmationModal } from '../../components/organisms';
import useOrder from '@/hooks/useOrders';
import { useSearchParams } from 'react-router-dom';
import { QueueReadySkeleton } from '@/components/molecules/Skeletons';
import { formatDateForAPI } from '@/utils/date';
import { useToast } from '@/context/ToastContext';

const QueueReady = () => {

	const { addToast } = useToast();
	const { data, loading, patchOrder, batchUpdateOrders } = useOrder();
	const [orderDetails, setOrderDetails] = useState(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const currentDateParams = searchParams.get('due_date')
	const selectedDate = currentDateParams ? new Date(currentDateParams) : null
	const [orderToComplete, setOrderToComplete] = useState(null);
	const [prepCompleteAll, setPrepCompleteAll] = useState(false);

	const hasCancellationFilter = searchParams.get('cancellation_requested') === 'true';
	const hasActiveFilters = Boolean(selectedDate) || hasCancellationFilter;
	const orderItems = Array.isArray(data?.results) ? data.results : [];

	if (loading) return <QueueReadySkeleton />

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

	const completeOrder = async (orderId, payload) => {
		if (!orderId) return;

		try {
			await patchOrder(orderId, payload);

			addToast("Order completed successfully");
			setOrderToComplete(null);
		} catch {
			addToast("Failed to complete order.", "error")
		}
	}

	const completeAllOrders = async () => {
		const orderIds = orderItems
			.filter((order) => order?.status === 'ready')
			.map((order) => String(order?.id || '').trim())
			.filter(Boolean);

		if (orderIds.length === 0) return;

		try {
			const response = await batchUpdateOrders({ order_ids: orderIds, status: 'completed' });
			const updatedCount = Number(response?.updated_count || 0);
			const errorCount = Array.isArray(response?.errors) ? response.errors.length : 0;

			if (updatedCount > 0) {
				addToast(
					updatedCount === 1
						? '1 order marked as completed'
						: `${updatedCount} orders marked as completed`,
					'success',
				);
			}

			if (errorCount > 0) {
				addToast(response?.errors?.[0] || 'Some orders could not be completed.', 'error');
			}
		} catch {
			addToast('Failed to complete orders.', 'error');
		} finally {
			setPrepCompleteAll(false);
		}
	}

	const listOrder = orderItems.map((cake, index) =>
		(<ReadyCard key={index} order={cake} onComplete={() => setOrderToComplete(cake)} onShowDetails={setOrderDetails} />) || null
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
						text='Complete All'
						onClick={() => setPrepCompleteAll(true)}
					/>
				)}
			</div>
			{orderItems.length > 0 ?
				<div className='grid grid-cols-4 gap-4 mt-8 min-h-100'>
					{listOrder}
				</div>
				:
				<div className='flex-1 flex w-full h-full justify-center items-center'>
					<h5 className='text-accent-text/75 font-semibold'>No ready orders</h5>
				</div>
			}

			<Pagination prev={data.previous} next={data.next} count={data?.count} pageSize={8} />


			{orderDetails &&
				<OrderDetails orderDetails={orderDetails} onClose={() => setOrderDetails(null)} />
			}

			{orderToComplete &&
				<CompletePaymentModal
					order={orderToComplete}
					onConfirm={completeOrder}
					onClose={() => setOrderToComplete(null)}
				/>
			}

			{prepCompleteAll &&
				<ConfirmationModal
					title={'Complete All Orders?'}
					content={'Are you sure you want to mark all listed ready orders as completed?'}
					onConfirm={completeAllOrders}
					onReject={() => setPrepCompleteAll(false)}
				/>
			}
		</div>
	)
}

export default QueueReady