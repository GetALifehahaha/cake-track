import React, { useState, useEffect } from 'react'
import { EllipsisVertical, ChevronLeft, ChevronRight, Minus } from 'lucide-react'
import { OrderDetails, QueueCard } from '../../components/organisms';
import { DatePicker } from '@/components/molecules';
import { Button } from '@/components/atoms';

const QueuePending = () => {

	const [dateFilter, setDateFilter] = useState()

	const orderDataDummy = [
		{
			id: 1425,
			due_date: '2025-11-25',
			cake: {
				name: "Birthday Cake",
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
			due_date: '2025-11-24',
			cake: {
				name: "Birthday Cake",
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
			due_date: '2025-11-24',
			cake: {
				name: "Birthday Cake",
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
	
	const handleSetDateFilter = (value) => {
		const filterDateString = new Date(value).toISOString().slice(0, 10);
		setDateFilter(value)
		setOrderData(orderDataDummy => orderDataDummy.filter((item) => item.due_date === filterDateString));
	}
	const removeDateFilter = () => setDateFilter()

	const [pageNum, setPageNum] = useState(1);
	const [orderData, setOrderData] = useState(orderDataDummy)
	const [orderDetails, setOrderDetails] = useState(null);

	const [showOrderDetails, setShowOrderDetails] = useState(false);

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

	const removeAllOrder = () => setOrderData([])

	const listOrder = orderData.map((cake, index) => 
		<QueueCard key={index} order={cake} onAccept={acceptOrder} onShowDetails={handleSetOrderDetails} onReject={handleDeleteOrder} />
	)

	return (
		<div className='flex flex-col min-h-140'>
			<div className='p-2 flex items-center gap-4'>
				<span className='w-60'>
					<DatePicker selected={dateFilter} onSelect={handleSetDateFilter} />
				</span>
				{dateFilter && 
					<>
						<Minus className='text-text/50 cursor-pointer' onClick={removeDateFilter} />
						<Button text='Accept All' onClick={removeAllOrder}/>
						<Button text='Reject All' onClick={removeAllOrder}/>
					</>
				}

			</div>
			<div className='grid grid-cols-5 gap-4'>
				{listOrder}
			</div>

			<div className='flex flex-row items-center gap-2 mt-auto mx-auto'>
				<button onClick={() => handleSetPageNum("prev")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
					<ChevronLeft size={18}/>
				</button>
				<span className='rounded-sm bg-main-dark aspect-square w-6 flex justify-center items-center'>
					<h5>
						{pageNum}
					</h5>
				</span>
				<button onClick={() => handleSetPageNum("next")} className='p-2 rounded-sm bg-main-dark cursor-pointer'>
					<ChevronRight size={18}/>
				</button>
			</div>

			{showOrderDetails &&
				<OrderDetails orderDetails={orderDetails} onClose={handleShowOrderDetails} />
			}
		</div>
	)
}

export default QueuePending