import React, { useState } from 'react'
import { Button, Title } from '../../components/atoms'
import { ArrowRight, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfirmationModal, ConfirmationModalWrapper } from '@/components/organisms'
import useOrder from '@/hooks/useOrders'
import Loading from '@/components/molecules/Loading'

const QueueOverview = () => {

	const { data, loading, error, patchOrder } = useOrder();
	const navigate = useNavigate();

	const [removeId, setRemoveId] = useState(-1);

	if (loading) return <Loading />
	console.log(data)
	if (error) return <h5>Error</h5>

	const acceptedOrdersHeaders = [
		"ID", "Name", "Cake Flavor", "w/ Cupcake", "Placement Order", "Due Date"
	]

	const inventoryData = {
		inStock: 0,
		outOfStock: 0,
		runningLow: 0,
		expired: 0
	}

	// FUNCTIONS
	const parseDate = (dateString) => {
		const date = new Date(dateString);

		if (isNaN(date.getTime())) {
			return "Invalid Date";
		}

		const month = date.getMonth() + 1;
		const day = date.getDate();
		const year = date.getFullYear();

		const mm = String(month).padStart(2, '0');
		const dd = String(day).padStart(2, '0');

		return `${mm}/${dd}/${year}`;
	};

	const capitalize = (str) => str[0].toUpperCase() + str.slice(1)

	/**
 * Checks if the given date is today or up to 3 days in the future.
 * * @param {string} dateString - Date in ISO format (e.g., '2025-11-28T...') or YYYY-MM-DD.
 * @returns {boolean} True if the date is within the next 3 days (inclusive of today).
 */
	const isDueSoon = (dateString) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const inputDate = new Date(dateString);

		if (isNaN(inputDate.getTime())) {
			return false;
		}

		inputDate.setHours(0, 0, 0, 0);

		const diffMs = inputDate.getTime() - today.getTime();

		const MS_PER_DAY = 1000 * 60 * 60 * 24;

		const diffDays = Math.round(diffMs / MS_PER_DAY);

		return diffDays >= 0 && diffDays <= 3;
	};

	// METHODS
	const setOrderToAccepted = async (id) => {
		try {
			const res = await patchOrder(id, { status: "Accepted" });
			console.log(res)
		} catch (err) {
			alert(err)
		}
	}

	// LISTS
	const listPending = data.results.filter((item) => item.status.toLowerCase() == "pending").slice(0, 5).map((order, index) =>
		<div key={index} className='flex justify-between w-full text-sm items-center'>
			<h5>{order.full_name}</h5>
			<h5 className='px-2 py-1 rounded-full border-gray-dark text-gray-dark border font-semibold '>{capitalize(order.cake_orders.occassion)}</h5>
			<h5>{parseDate(order.due_date)}</h5>
			<div className='flex items-center gap-4'>
				<ConfirmationModalWrapper title='Reject order' content='Please confirm that you wish to reject this order. You will be required to provide a reason for the rejection.' onReject={() => setRemoveId(-1)}>
					<X className='text-red-500' onClick={() => setRemoveId(item.id)} size={18} />
				</ConfirmationModalWrapper>
				<ConfirmationModalWrapper title='Accept order' content={`Confirm acceptance of Order #${order.id}. This action is irreversible and places the order into the active production schedule.`} onReject={() => setRemoveId(-1)} onConfirm={() => setOrderToAccepted(order.id)}>
					<Check className='text-green-500' size={18} />
				</ConfirmationModalWrapper>
			</div>
		</div>
	)
	const listAccepted = data.results.filter((item) => item.status.toLowerCase() == "accepted").slice(0, 5).map((order, index) =>
		<div key={index} className='flex justify-between items-center py-2 w-full border-b border-b-main-dark'>
			<h5 className='flex-1 text-center'>{order.id}</h5>
			<h5 className='flex-1 text-center'>{order.full_name}</h5>
			<h5 className='flex-1 text-center'>{capitalize(order.cake_orders.base_flavor)}</h5>
			<span className='flex-1 flex justify-center'>
				{order.cupcake_orders
					? <h5 className='text-center'>Yes</h5>
					: <h5 className='text-center text-xs font-semibold text-text/50 border border-gray-400 w-fit px-4 rounded-full'>No</h5>}
			</span>
			<h5 className='flex-1 text-center'>{parseDate(order.created_at)}</h5>
			<h5 className='flex-1 text-center'>{parseDate(order.due_date)}</h5>
		</div>
	)
	const listDueSoon = data.results.filter((item) => isDueSoon(item.due_date)).slice(0, 5).map((order, index) =>
		<div key={index} className='flex justify-between items-center w-full px-4'>
			<h5 className='text-center py-1 font-medium'>{order.full_name}</h5>
			<h5 className='text-center py-1'>{parseDate(order.due_date)}</h5>
		</div>
	)

	const listAcceptedOrdersHeaders = acceptedOrdersHeaders.map((header, index) => <h5 key={index} className='text-accent-mute text-sm basis-1/6 text-center'>{header}</h5>)

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex flex-row gap-4 w-full'>
				<div className='flex-1 p-4 bg-main-white rounded-xl border border-border'>
					<div className='flex justify-between items-center pb-2 border-b border-b-border'>
						<div className='flex gap-2'>
							<Title variant='modal' text='Pending' />
							<h5 className='font-semibold text-text/50'>{data.results.filter((order) => order.status.toLowerCase() == "pending").length}</h5>
						</div>
						<button className='flex items-center gap-2 text-accent cursor-pointer' onClick={() => navigate('/queue/pending')}><h5>View All</h5><ArrowRight size={16} /></button>
					</div>

					{/* Pending Body */}
					<div>
						<div className='flex flex-col gap-2 p-2 text-xs font-medium'>
							{listPending}
						</div>
					</div>
				</div>


				<div className='flex-1 p-4 bg-main-white rounded-xl border border-border'>
					<div className='flex justify-between items-center pb-2 border-b border-b-border'>
						<Title variant='modal' text='Due Soon' />
						<button className='flex items-center gap-2 text-accent cursor-pointer' onClick={() => navigate('/queue/accepted')}><h5>View All</h5><ArrowRight size={16} /></button>
					</div>

					{/* Due Soon Body */}
					<div>
						{listDueSoon}
					</div>
				</div>


				<div className='flex-1 p-4 bg-main-white rounded-xl border border-border'>
					<div className='flex justify-between items-center pb-2 border-b border-b-border'>
						<Title variant='modal' text='Inventory Status' />
						<button className='flex items-center gap-2 text-accent cursor-pointer' onClick={() => navigate('/inventory')}><h5>View All</h5><ArrowRight size={16} /></button>
					</div>

					{/* Inventory Status Body */}
					<div className='grid grid-cols-2'>
						<span className='flex flex-col justify-center items-center p-4'>
							<h5 className='text-text/50 font-semibold'>In Stock</h5>
							<h5 className='text-success font-bold text-2xl'>{inventoryData.inStock}</h5>
						</span>
						<span className='flex flex-col justify-center items-center p-4'>
							<h5 className='text-text/50 font-semibold'>Running Low</h5>
							<h5 className='text-warning font-bold text-2xl'>{inventoryData.runningLow}</h5>
						</span>
						<span className='flex flex-col justify-center items-center p-4'>
							<h5 className='text-text/50 font-semibold'>Out of Stock</h5>
							<h5 className='text-error font-bold text-2xl'>{inventoryData.outOfStock}</h5>
						</span>
						<span className='flex flex-col justify-center items-center p-4'>
							<h5 className='text-text/50 font-semibold'>Expired</h5>
							<h5 className='text-none font-bold text-2xl'>{inventoryData.expired}</h5>
						</span>
					</div>
				</div>
			</div>

			<div className='flex-1 p-4 bg-main-white rounded-xl border border-border min-h-80'>
				<div className='flex justify-between items-center '>
					<Title variant='modal' text='Accepted Orders' />
				</div>

				<div className='py-2 border-b border-b-border flex flex-row items-center'>
					{listAcceptedOrdersHeaders}
				</div>

				<div>
					{listAccepted}
				</div>
			</div>
		</div>
	)
}

export default QueueOverview