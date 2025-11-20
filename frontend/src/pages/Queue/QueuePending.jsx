import React, { useState } from 'react'
import { EllipsisVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { OrderDetails, QueueCard } from '../../components/organisms';

const QueuePending = () => {

	const orderDataDummy = [
		{
			id: 1425,
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

	const listOrder = orderData.map((cake, index) => 
		<QueueCard order={cake} onAccept={acceptOrder} onShowDetails={handleSetOrderDetails} onReject={handleDeleteOrder} />
	)

	return (
		<div className='flex flex-col min-h-140'>
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