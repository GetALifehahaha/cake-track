import React, { useState } from 'react'
import { EllipsisVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { AcceptedCard } from '../../components/organisms';

const QueueAccepted = () => {

	const orderData = [
		{
			id: 1425,
			cake: {
				name: "Birthday Cake",
				amount: 1,
				flavor: "Chocolate",
				filling: "Custard",
				shape: "Round", 
				inscription: "On-Cake"
			},
			cupcake: {
				amount: 12,
				flavor: "Chocolate",
				finish: "Frosting"
			},
			client: "Maria Antoniette Clare Gurain",
			due_date: "October 20, 2025"
		},
	]

	const [pageNum, setPageNum] = useState(1);
	const [acceptedOrders, setAcceptedOrders] = useState(orderData)
	
	const handleSetPageNum = (direction) => {
		if (direction == "prev") {
			if (pageNum - 1 == 0) return;

			setPageNum(pageNum - 1);
		} else if (direction == "next") {
			setPageNum(pageNum + 1);
		}
	}

	const completeOrder = (id) => {
		setAcceptedOrders(order => {
			let curr = order.filter(ord => ord.id != id)

			return curr
		})
	}
	

	const listOrder = orderData.map((cake, index) => 
		<AcceptedCard order={cake} onDone={completeOrder} />
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
		</div>
	)
}

export default QueueAccepted