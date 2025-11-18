import React from 'react'
import { Title } from '../../components/atoms'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QueueOverview = () => {

	const navigate = useNavigate();

	const acceptedOrdersHeaders = [
		"ID", "Name", "Cake Flavor", "w/ Cupcake", "Placement Order", "Due Date"
	]
	
	const inventoryData = {
			inStock: 0,
			outOfStock: 0,
			runningLow: 0,
			expired: 0
	}

	const pendingData = [
		{name: "Marie Antoniette", date: "Oct 20, 2025"}
	]

	const listPending = pendingData.map(({name, date}, index) => 
		<span className='flex justify-between p-4 text-sm'>
			<h5>{name}</h5>
			<h5>{date}</h5>
		</span>)

	const listAcceptedOrdersHeaders = acceptedOrdersHeaders.map((header, index) => <h5 key={index} className='text-accent-mute text-sm basis-1/6 text-center'>{header}</h5>)
	

  return (
	<div className='flex flex-col gap-4'>
		<div className='flex flex-row gap-4 w-full'>
			<div className='flex-1 p-4 bg-main-white rounded-xl border border-border'>
				<div className='flex justify-between items-center pb-2 border-b border-b-border'>
					<Title variant='modal' text='Pending' />
					<button className='flex items-center gap-2 text-accent cursor-pointer' onClick={() => navigate('/queue/pending')}><h5>View All</h5><ArrowRight size={16}/></button>
				</div>

				{/* Pending Body */}
				<div>
					{listPending}
				</div>
			</div>


			<div className='flex-1 p-4 bg-main-white rounded-xl border border-border'>
				<div className='flex justify-between items-center pb-2 border-b border-b-border'>
					<Title variant='modal' text='Due Soon' />
					<button className='flex items-center gap-2 text-accent cursor-pointer' onClick={() => navigate('/queue/accepted')}><h5>View All</h5><ArrowRight size={16} /></button>
				</div>

				{/* Due Soon Body */}
				<div>

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
		</div>
	</div>
  )
}

export default QueueOverview