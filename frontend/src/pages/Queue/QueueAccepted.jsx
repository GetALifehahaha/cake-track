import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DatePicker } from '@/components/molecules';
import { AcceptedCard, OrderDetails, ConfirmationModal } from '../../components/organisms';
import useOrder from '@/hooks/useOrders';
import { useSearchParams } from 'react-router-dom';
import Loading from '@/components/molecules/Loading';
import { formatDateForAPI } from '@/utils/date';
import { useToast } from '@/context/ToastContext';

const QueueAccepted = () => {


	const { addToast } = useToast();
	const { data, loading, error, patchOrder } = useOrder();
	const [orderDetails, setOrderDetails] = useState(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const currentDateParams = searchParams.get('due_date')
	const selectedDate = currentDateParams ? new Date(currentDateParams) : null
	const [completeId, setCompleteId] = useState(-1);
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


	const handleSetPageNum = (direction) => {
		if (direction == "prev") {
			if (pageNum - 1 == 0) return;

			setPageNum(pageNum - 1);
		} else if (direction == "next") {
			setPageNum(pageNum + 1);
		}
	}

	const completeOrder = async () => {
		if (completeId == -1) return;

		try {
			await patchOrder(completeId, { status: "completed" });

			addToast("Order completed successfully");
			setCompleteId(-1);
		} catch (err) {
			addToast("Failed to accept order.", "error")
		}
	}

	const listOrder = data.results?.map((cake, index) =>
		(<AcceptedCard key={index} order={cake} onComplete={() => setCompleteId(cake.id)} onShowDetails={setOrderDetails} />) || null
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
				<div className='grid grid-cols-5 gap-4 mt-8'>
					{listOrder}
				</div>
				:
				<div className='flex w-full h-full justify-center items-center'>
					<h5 className='text-accent-text/75 font-semibold'>No accepted orders</h5>
				</div>
			}

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

			{orderDetails &&
				<OrderDetails orderDetails={orderDetails} onClose={() => setOrderDetails(null)} />
			}

			{completeId > -1 &&
				<ConfirmationModal title={"Accept Order?"} content={"Are you sure you want to accept this order?"} onConfirm={completeOrder} onReject={() => setCompleteId(-1)} />
			}
		</div>
	)
}

export default QueueAccepted