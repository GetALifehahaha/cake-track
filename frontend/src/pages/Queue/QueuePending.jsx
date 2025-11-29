import React, { useState, useEffect } from 'react'
import { EllipsisVertical, ChevronLeft, ChevronRight, Minus } from 'lucide-react'
import { ConfirmationModal, ConfirmationModalWrapper, OrderDetails, QueueCard } from '../../components/organisms';
import { DatePicker } from '@/components/molecules';
import { Button } from '@/components/atoms';
import Loading from '@/components/molecules/Loading';
import useOrder from '@/hooks/useOrders';
import { useSearchParams } from 'react-router-dom';
import { formatDateForAPI } from '@/utils/date';
import { useToast } from '@/context/ToastContext';
import { id } from 'date-fns/locale';

const QueuePending = () => {

	const { addToast } = useToast();

	const { data, loading, error, patchOrder, batchUpdateOrders } = useOrder();
	const [pageNum, setPageNum] = useState(1);
	const [orderDetails, setOrderDetails] = useState(null);
	const [showOrderDetails, setShowOrderDetails] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const currentDateParams = searchParams.get('due_date')
	const selectedDate = currentDateParams ? new Date(currentDateParams) : null

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

	const handleSetPageNum = (direction) => {
		if (direction == "prev") {
			if (pageNum - 1 == 0) return;

			setPageNum(pageNum - 1);
		} else if (direction == "next") {
			setPageNum(pageNum + 1);
		}
	}

	const acceptOrder = (id) => {
		setOrderData(order => {
			let curr = order.filter(ord => ord.id != id)

			return curr
		})
	}

	const handleSetOrderDetails = (order) => {
		setOrderDetails(order);
		handleShowOrderDetails();
	}

	const handleShowOrderDetails = () => {
		if (!orderDetails) setShowOrderDetails(false);

		setShowOrderDetails(!showOrderDetails)
	}

	const handleDeleteOrder = (id) => {
		setOrderData(items => items.filter((item) => item.id != id))
	}

	const acceptAllOrder = async () => {

		const orderIds = data.results.map(order => order.id);

		try {
			await batchUpdateOrders({ order_ids: orderIds, status: "accepted" });

			addToast("Orders accepted successfully", "success")
		} catch (err) {
			addToast(`Error: ${err}`, "error")
		}
	}

	const removeAllOrder = () => setOrderData([])

	const listOrder = data.results.map((cake, index) =>
		<QueueCard key={index} order={cake} onAccept={acceptOrder} onShowDetails={handleSetOrderDetails} onReject={handleDeleteOrder} />
	)

	return (
		<div className='flex flex-col min-h-140'>
			<div className='p-2 flex items-center gap-4 py-4 border-b border-main-dark'>
				<span className='w-60'>
					<DatePicker className='bg-white' selected={selectedDate} onSelect={handleSetDateFilter} />
				</span>
				{selectedDate &&
					<>
						<Minus className='text-text/50 cursor-pointer' onClick={() => handleSetDateFilter(false)} />
						<div className='flex-1' />
						<ConfirmationModalWrapper title={'Accept ALL orders'} content={"Are you sure you want to accept ALL orders?"} onConfirm={acceptAllOrder}>
							<h5 className='px-4 py-1 rounded-sm bg-accent text-white font-semibold cursor-pointer'>Accept All</h5>
						</ConfirmationModalWrapper>
						<ConfirmationModalWrapper title={'Accept ALL orders'} content={"Are you sure you want to accept ALL orders?"} onConfirm={acceptAllOrder}>
							<h5 className='px-4 py-1 rounded-sm bg-error text-white font-semibold cursor-pointer'>Reject All</h5>
						</ConfirmationModalWrapper>
					</>
				}

			</div>
			<div className='grid grid-cols-5 gap-4 mt-8'>
				{listOrder}
			</div>

			<div className='flex flex-row items-center gap-2 mt-auto mx-auto'>
				<button onClick={() => handleSetPageNum("prev")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
					<ChevronLeft size={18} />
				</button>
				<span className='rounded-sm bg-main-dark aspect-square w-6 flex justify-center items-center'>
					<h5>
						{pageNum}
					</h5>
				</span>
				<button onClick={() => handleSetPageNum("next")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
					<ChevronRight size={18} />
				</button>
			</div>

			{showOrderDetails &&
				<OrderDetails orderDetails={orderDetails} onClose={handleShowOrderDetails} />
			}
		</div>
	)
}

export default QueuePending