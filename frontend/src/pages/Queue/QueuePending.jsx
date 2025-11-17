import React, { useState } from 'react'
import { EllipsisVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { QueueCard } from '@/components/organisms';

const QueuePending = () => {

	const orderDataDummy = [
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
			client: "Maria Antoniette Clare Gurain"
		},
		{
			id: 1426,
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
			client: "Maria Antoniette Clare Gurain"
		},
		{
			id: 1427,
			cake: {
				name: "Birthday Cake",
				amount: 1,
				flavor: "Chocolate",
				filling: "Custard",
				shape: "Round", 
				inscription: "On-Cake"
			},
			client: "Maria Antoniette Clare Gurain"
		},
	]

	const [pageNum, setPageNum] = useState(1);
	const [orderData, setOrderData] = useState(orderDataDummy)

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

	const listOrder = orderData.map((cake, index) => 
		<QueueCard order={cake} onAccept={acceptOrder} />
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

export default QueuePending