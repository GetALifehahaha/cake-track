import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DatePicker, Pagination } from '@/components/molecules';
import { ReadyCard, OrderDetails, CompletePaymentModal } from '../../components/organisms';
import useOrder from '@/hooks/useOrders';
import { useSearchParams } from 'react-router-dom';
import Loading from '@/components/molecules/Loading';
import { formatDateForAPI } from '@/utils/date';
import { useToast } from '@/context/ToastContext';

const QueueAccepted = () => {

	const { addToast } = useToast();
	const { data, loading, patchOrder } = useOrder();
	const [orderDetails, setOrderDetails] = useState(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const currentDateParams = searchParams.get('due_date')
	const selectedDate = currentDateParams ? new Date(currentDateParams) : null
	const [orderToComplete, setOrderToComplete] = useState(null);
	const [pageNum, setPageNum] = useState(1);

	if (loading) return <Loading />

	const handleSetDateFilter = (date) => {
		const newParams = Object.fromEntries(searchParams.entries());

		if (date) {
			newParams.due_date = formatDateForAPI(date)
		} else {
			delete newParams.due_date
		}

		setSearchParams(newParams)
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

	const listOrder = data.results?.map((cake, index) =>
		(<ReadyCard key={index} order={cake} onComplete={() => setOrderToComplete(cake)} onShowDetails={setOrderDetails} />) || null
	)

	return (
		<div className='flex flex-col min-h-140'>
			<div className='p-2 flex items-center gap-4 py-4 border-b border-main-dark'>
				<span className='w-60'>
					<DatePicker className='bg-white' selected={selectedDate} onSelect={handleSetDateFilter} />
				</span>
				{selectedDate &&
					<X size={18} className='text-text/50 cursor-pointer' onClick={() => handleSetDateFilter(false)} />
				}
			</div>
			{data.results?.length > 0 ?
				<div className='grid grid-cols-4 gap-4 mt-8 min-h-100'>
					{listOrder}
				</div>
				:
				<div className='flex w-full h-full justify-center items-center'>
					<h5 className='text-accent-text/75 font-semibold'>No accepted orders</h5>
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
		</div>
	)
}

export default QueueAccepted