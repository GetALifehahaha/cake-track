import React, { useState } from 'react'
import { Ellipsis, X } from 'lucide-react';
import { DatePicker, Pagination } from '@/components/molecules';
import { OrderDetails } from '../../components/organisms';
import Loading from '@/components/molecules/Loading';
import useOrder from '@/hooks/useOrders';
import { useSearchParams } from 'react-router-dom';
import { formatDateForAPI } from '@/utils/date';
import { capitalize } from '@/utils/capitalize';
import { formatCasing } from '@/utils/formatCasing';

const QueueUnpaid = () => {

	const { data, loading, error } = useOrder();
	const [orderDetails, setOrderDetails] = useState(null);
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

	const listOrder = data.results?.map((order, index) =>
		<div
			className='rounded-lg border border-border p-6 bg-main-white relative hover:shadow-md cursor-pointer min-h-60'
			key={index}
			onClick={() => setOrderDetails(order)}
		>
			{/* Unpaid Badge */}
			<div className='absolute top-3 right-3'>
				<span className='px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold border border-orange-200'>
					Unpaid
				</span>
			</div>

			<div className='flex justify-between items-center'>
				<h5 className='text-black text-sm font-semibold'>Order {order.id}</h5>
				<Ellipsis
					onClick={(e) => {
						e.stopPropagation();
						setOrderDetails(order);
					}}
					className='cursor-pointer'
					size={16}
				/>
			</div>
			<h5 className='text-accent-text text-xs'>{order.full_name}</h5>

			{/* Cake Details */}
			<div className='flex mt-4'>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>{capitalize(order.cake_orders?.occasion || '')}</h5>
					<h5 className='text-xs text-accent-text'>Flavor: <strong>{capitalize(order.cake_orders?.base_flavor || '')}</strong></h5>
					<h5 className='text-xs text-accent-text'>Filling: <strong>{capitalize(order.cake_orders?.filling || '')}</strong></h5>
					<h5 className='text-xs text-accent-text'>Shape: <strong>{capitalize(order.cake_orders?.shape || '')}</strong></h5>
					<h5 className='text-xs text-accent-text'>Inscription: <strong>{formatCasing(order.cake_orders?.message_type || 'none')}</strong></h5>
				</div>
			</div>

			{/* Cupcake if there's any */}
			{order.cupcake_orders &&
				<div className='flex mt-2 mb-4'>
					<h5 className='basis-1/5 text-center font-bold text-md'>
						{order.cupcake_orders.amount}x
					</h5>
					<div className='flex flex-col gap-0.5'>
						<h5 className='font-bold text-md'>Cupcakes</h5>
						<h5 className='text-xs text-accent-text capitalize'>Frosting Color: <strong>{order.cupcake_orders.frosting}</strong></h5>
					</div>
				</div>
			}
		</div>
	)

	return (
		<div className='flex flex-col min-h-140'>
			<div className='p-2 flex items-center gap-4 py-4 border-b border-main-dark'>
				<span className='w-60'>
					<DatePicker className='bg-main-white cursor-pointer' selected={selectedDate} onSelect={handleSetDateFilter} />
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
					<h5 className='text-accent-text/75 font-semibold'>No unpaid orders</h5>
				</div>
			}

			<Pagination prev={data.previous} next={data.next} />

			{orderDetails &&
				<OrderDetails orderDetails={orderDetails} onClose={() => setOrderDetails(null)} />
			}
		</div>
	)
}

export default QueueUnpaid
