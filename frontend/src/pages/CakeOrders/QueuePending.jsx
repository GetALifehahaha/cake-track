import React, { useState } from 'react'
import { Ellipsis } from 'lucide-react'
import { ConfirmationModal, ConfirmationModalWrapper, OrderDetails, InputRejectModal, InputRefundModal } from '../../components/organisms';
import { DatePicker, Pagination } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { QueuePendingSkeleton } from '@/components/molecules/Skeletons';
import useOrder from '@/hooks/useOrders';
import { useSearchParams } from 'react-router-dom';
import { formatDateForAPI } from '@/utils/date';
import { useToast } from '@/context/ToastContext';
import { capitalize } from '@/utils/capitalize';
import { formatCasing } from '@/utils/formatCasing'
const QueuePending = () => {

	const { addToast } = useToast();

	const { data, loading, patchOrder, batchUpdateOrders, refundOrder } = useOrder();
	const [orderDetails, setOrderDetails] = useState(null);
	const [showOrderDetails, setShowOrderDetails] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const currentDateParams = searchParams.get('due_date')
	const selectedDate = currentDateParams ? new Date(currentDateParams) : null
	const [showOptions, setShowOptions] = useState(null);
	const [prepAcceptId, setPrepAcceptId] = useState(null);
	const [prepRejectId, setPrepRejectId] = useState(null);
	const [prepRejectAll, setPrepRejectAll] = useState(false);
	const [refundTarget, setRefundTarget] = useState(null);
	const hasCancellationFilter = searchParams.get('cancellation_requested') === 'true';
	const hasActiveFilters = Boolean(selectedDate) || hasCancellationFilter;
	const orderItems = Array.isArray(data?.results) ? data.results : [];

	if (loading) return <QueuePendingSkeleton />

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

	const acceptOrder = async () => {
		if (prepAcceptId == null) return;

		try {
			await patchOrder(prepAcceptId, { status: "accepted" });

			addToast("Order accepted successfully");
			setPrepAcceptId(null);
		} catch {
			addToast("Failed to accept order.", "error")
		}
	}



	const handleSetOrderDetails = (order) => {
		setOrderDetails(order);
		handleShowOrderDetails();
	}

	const handleShowOrderDetails = () => {
		if (!orderDetails) setShowOrderDetails(false);

		setShowOrderDetails(!showOrderDetails)
	}

	const acceptAllOrder = async () => {
		const orderIds = orderItems.map(order => order.id);

		if (orderIds.length === 0) return;

		try {
			await batchUpdateOrders({ order_ids: orderIds, status: "accepted" });

			addToast("Orders accepted successfully", "success")
		} catch (err) {
			addToast(`Error: ${err}`, "error")
		}
	}

	const rejectOrder = async (rejectReason) => {
		if (prepRejectId == null) return;

		try {
			await patchOrder(prepRejectId, { "status": "rejected", "reject_reason": rejectReason });

			addToast("Order declined successfully");
			setPrepRejectId(null);
		} catch {
			addToast("Failed to decline order.", "error")
		}
	}

	const rejectAllOrder = async (rejectReason) => {
		const orderIds = orderItems.map(order => order.id);

		if (orderIds.length === 0) return;

		try {
			await batchUpdateOrders({ order_ids: orderIds, status: "rejected", "reject_reason": rejectReason });

			addToast("Orders rejected successfully", "success");
			setPrepRejectAll(false);
		} catch (err) {
			addToast(`Error: ${err}`, "error")
		}
	}

	const handleRefundOrder = async (refundReferenceNumber) => {
		if (!refundTarget?.id) return;

		try {
			await refundOrder(refundTarget.id, { refund_reference_number: refundReferenceNumber });
			addToast('Order refunded successfully', 'success');
			setRefundTarget(null);
		} catch {
			addToast('Failed to refund order.', 'error');
		}
	}

	const listOrder = orderItems.map((cake, index) => {
		const customerName = [cake.customer_first_name, cake.customer_last_name]
			.filter(Boolean)
			.join(' ')
			.trim() || cake.full_name || 'Unknown Customer';

		return (
		<div
			className='rounded-lg border border-border p-6 bg-main-white relative hover:shadow-md cursor-pointer min-h-60 h-fit'
			onClick={() => setShowOptions(cake.id)}
			key={index}
		>
			{showOptions === cake.id &&
				<div
					className='absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center gap-6 z-10'
					onClick={(e) => { e.stopPropagation(); setShowOptions(null) }}
				>
					<Button variant='success' text='ACCEPT' onClick={(e) => { e.stopPropagation(); setPrepAcceptId(cake.id) }} />
					<Button variant='error' text='DECLINE' onClick={(e) => { e.stopPropagation(); setPrepRejectId(cake.id) }} />
					{cake.cancellation_requested && (
						<Button
							variant='error'
							text='REFUND'
							onClick={(e) => {
								e.stopPropagation();
								setRefundTarget(cake);
								setShowOptions(null);
							}}
						/>
					)}
				</div>
			}

			<div className='flex justify-between items-center'>
				<h5 className='text-black text-sm font-semibold'>Order {cake.id}</h5>
				<Ellipsis
					onClick={(e) => {
						e.stopPropagation();
						handleSetOrderDetails(cake);
					}}
					className='cursor-pointer'
					size={16}
				/>
			</div>
			<h5 className='text-accent-text text-xs'>{customerName}</h5>

			{/* Cake Details */}
			<div className='flex mt-4'>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>{capitalize(cake.cake_orders.occasion)}</h5>
					<h5 className='text-xs text-accent-text'>Flavor: <strong>{capitalize(cake.cake_orders.base_flavor)}</strong></h5>
					<h5 className='text-xs text-accent-text'>Filling: <strong>{capitalize(cake.cake_orders.filling)}</strong></h5>
					<h5 className='text-xs text-accent-text'>Shape: <strong>{capitalize(cake.cake_orders.shape)}</strong></h5>
					<h5 className='text-xs text-accent-text'>Inscription: <strong>{formatCasing(cake.cake_orders.message_type)}</strong></h5>
				</div>
			</div>

			{/* Cupcake if there's any */}
			{cake.cupcake_orders &&
				<div className='flex mt-2 mb-4'>
					<h5 className='basis-1/5 text-center font-bold text-md'>
						{cake.cupcake_orders.amount}x
					</h5>
					<div className='flex flex-col gap-0.5'>
						<h5 className='font-bold text-md'>Cupcakes</h5>
						<h5 className='text-xs text-accent-text capitalize'>Frosting Color: <strong>{cake.cupcake_orders.frosting}</strong></h5>
					</div>
				</div>
			}

			{cake.cancellation_requested && showOptions !== cake.id && (
				<span className='absolute bottom-3 right-3 px-2 py-1 rounded-full bg-error text-white text-[10px] font-semibold leading-none'>
					Refund Requested
				</span>
			)}
		</div>
	)})

	return (
		<div className='flex flex-col min-h-140'>
			<div className='p-2 flex items-center gap-4 py-4 border-b border-main-dark'>
				<span className='w-60'>
					<DatePicker className='bg-main-white cursor-pointer' selected={selectedDate} onSelect={handleSetDateFilter} />
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
					<>
						<ConfirmationModalWrapper title={'Accept ALL orders'} content={"Are you sure you want to accept ALL orders?"} onConfirm={acceptAllOrder}>
							<h5 className='px-4 py-1 rounded-sm bg-accent text-white font-semibold cursor-pointer'>Accept All</h5>
						</ConfirmationModalWrapper>
						<ConfirmationModalWrapper title={'Reject ALL orders'} content={"Are you sure you want to reject ALL orders?"} onConfirm={() => setPrepRejectAll(true)}>
							<h5 className='px-4 py-1 rounded-sm bg-error text-white font-semibold cursor-pointer'>Reject All</h5>
						</ConfirmationModalWrapper>
					</>
				)}
			</div>
			{orderItems.length > 0 ?
				<div className='grid grid-cols-4 gap-4 mt-8 min-h-100'>
					{listOrder}
				</div>
				:
				<div className='flex-1 flex w-full h-full justify-center items-center'>
					<h5 className='text-accent-text/75 font-semibold'>No orders</h5>
				</div>
			}

			<Pagination prev={data.previous} next={data.next} count={data?.count} pageSize={8} />

			{showOrderDetails &&
				<OrderDetails orderDetails={orderDetails} onClose={handleShowOrderDetails} />
			}

			{prepAcceptId &&
				<ConfirmationModal title={"Accept Order?"} content={"Are you sure you want to accept this order?"} onConfirm={acceptOrder} onReject={() => setPrepAcceptId(null)} />
			}

			{prepRejectId &&
				<InputRejectModal onConfirm={rejectOrder} onReject={() => setPrepRejectId(null)} />
			}

			{prepRejectAll &&
				<InputRejectModal onConfirm={rejectAllOrder} onReject={() => setPrepRejectAll(false)} />
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

export default QueuePending