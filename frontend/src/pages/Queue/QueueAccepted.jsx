import React, { useState } from 'react'
import { EllipsisVertical, ChevronLeft, ChevronRight } from 'lucide-react';

const QueueAccepted = () => {

	const [pageNum, setPageNum] = useState(1);
	
	const handleSetPageNum = (direction) => {
		if (direction == "prev") {
			if (pageNum - 1 == 0) return;

			setPageNum(pageNum - 1);
		} else if (direction == "next") {
			setPageNum(pageNum + 1);
		}
	}

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

	const listOrder = orderData.map((cake, index) => 
		<div key={index} className='rounded-lg border border-border p-6 bg-main-white'>
			<div className='flex justify-between items-center'>
				<h5 className='text-accent-text text-sm'>Order {cake.id}</h5>
				<EllipsisVertical size={16} />
			</div>
			<h5 className='text-accent-text text-xs'>{cake.client}</h5>
			<span className='flex items-center gap-1'>
				<h5 className='text-accent-text text-xs'>Due:</h5>
				<h5 className='text-error text-xs'>{cake.due_date}</h5>
			</span>

			{/* Cake Details */}
			<div className='flex mt-4'>
				<h5 className='basis-1/5 text-center font-bold text-md'>
					{cake.cake.amount}x
				</h5>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>{cake.cake.name}</h5>
					<h5 className='text-xs text-accent-text'>Flavor: {cake.cake.flavor}</h5>
					<h5 className='text-xs text-accent-text'>Finish: {cake.cake.finish}</h5>
					<h5 className='text-xs text-accent-text'>Filling: {cake.cake.filling}</h5>
					<h5 className='text-xs text-accent-text'>Shape: {cake.cake.shape}</h5>
					<h5 className='text-xs text-accent-text'>Inscription: {cake.cake.inscription}</h5>
				</div>
			</div>

			{/* Cupcake if there's any */}
			{cake.cupcake && 
			<div className='flex mt-2 mb-4'>
				<h5 className='basis-1/5 text-center font-bold text-md'>
					{cake.cupcake.amount}x
				</h5>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>Cupcakes</h5>
					<h5 className='text-xs text-accent-text'>Flavor: {cake.cupcake.flavor}</h5>
					<h5 className='text-xs text-accent-text'>Finish: {cake.cupcake.finish}</h5>
				</div>
			</div>
			}
		</div>
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