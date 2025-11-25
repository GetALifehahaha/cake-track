import React, { useState } from 'react'
import { Button, Title } from '../../components/atoms'
import { ArrowRight, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfirmationModal } from '@/components/organisms'

const QueueOverview = () => {

	const dummyData = [
		{
			id: 1425,
			date: '2025-11-25',
			cake: {
				name: "Birthday",
				amount: 1,
				flavor: "Chocolate",
				filling: "Custard",
				finish: 'Frosting',
				shape: 'Round',
				tier: 1,
				inscription: "On-Cake",
				inscription_message: 'HAPPY BIRTHDAY Melinda!'
			},
			cupcake: {
				amount: 12,
				flavor: "Chocolate",
				finish: "Frosting"
			},
			client: "Maria Antoniette Clare Gurain",
			contact: '09177828636',
			ingredients: [
				"2 cups of flour",
				"2 cups sugar",
				"2 eggs",
				"Vanilla Extract",
				"Salt",
			]
		},
		{
			id: 1426,
			date: '2025-11-24',
			cake: {
				name: "Birthday",
				amount: 1,
				flavor: "Chocolate",
				filling: "Custard",
				finish: 'Frosting',
				shape: 'Round',
				tier: 1,
				inscription: "On-Cake",
				inscription_message: 'HAPPY BIRTHDAY Melinda!'
			},
			cupcake: {
				amount: 12,
				flavor: "Chocolate",
				finish: "Frosting"
			},
			client: "Maria Antoniette Clare Gurain",
			contact: '09177828636',

		},
		{
			id: 1427,
			date: '2025-11-24',
			cake: {
				name: "Birthday",
				amount: 1,
				flavor: "Chocolate",
				filling: "Custard",
				finish: 'Frosting',
				tier: 1,
				shape: "Round", 
				inscription: "On-Cake",
				inscription_message: 'HAPPY BIRTHDAY Melinda!'
			},
			client: "Maria Antoniette Clare Gurain",
			contact: '09177828636',
		},
	]

	const navigate = useNavigate();
	const [pendingData, setPendingData] = useState(dummyData)
	const [acceptConfirmation, setAcceptConfirmation] = useState(false);
	const [rejectConfirmation, setRejectConfirmation] = useState(false);
	const [removeId, setRemoveId] = useState();

	const showAccept = (id) => {setAcceptConfirmation(true); setRemoveId(id)}
	const closeAccept = (id) => {setAcceptConfirmation(false); setRemoveId()}
	const showReject = (id) => {setRejectConfirmation(true); setRemoveId(id)}
	const closeReject = (id) => {setRejectConfirmation(false); setRemoveId()}
	const removeOrder = () => {setPendingData(pendingData.filter(data => data.id != removeId)); closeAccept(); closeReject();}

	const acceptedOrdersHeaders = [
		"ID", "Name", "Cake Flavor", "w/ Cupcake", "Placement Order", "Due Date"
	]
	
	const inventoryData = {
			inStock: 0,
			outOfStock: 0,
			runningLow: 0,
			expired: 0
	}

	const listPending = pendingData.map((data, index) => 
		<div key={index} className='flex justify-between w-full'>
			<h5>{data.client}</h5>
			<h5>{data.cake.name}</h5>
			<h5>{data.date}</h5>
			<button className='text-error cursor-pointer' onClick={() => showReject(data.id)}><X size={18} /></button>
			<button className='text-success cursor-pointer' onClick={() => showAccept(data.id)}><Check size={18} /></button>
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
						<h5 className='font-semibold text-text/50'>{pendingData.length}</h5>
					</div>
					<button className='flex items-center gap-2 text-accent cursor-pointer' onClick={() => navigate('/queue/pending')}><h5>View All</h5><ArrowRight size={16}/></button>
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

		{acceptConfirmation &&
			<ConfirmationModal title="Accept Order?" content="This will be added to your accepted orders" onConfirm={removeOrder} onReject={closeAccept} />
		}
		{rejectConfirmation &&
			<ConfirmationModal title="Reject Order?" content="" onConfirm={removeOrder} onReject={closeReject}/>
		}
	</div>
  )
}

export default QueueOverview