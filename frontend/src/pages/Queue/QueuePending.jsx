import React from 'react'
import { EllipsisVertical } from 'lucide-react'

const QueuePending = () => {

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

	const listOrder = orderData.map((cake, index) => 
		<div key={index} className='rounded-lg border border-border p-6 bg-main-white'>
			<div className='flex justify-between items-center'>
				<h5 className='text-accent-mute text-sm'>Order {cake.id}</h5>
				<EllipsisVertical size={16} />
			</div>
			<h5 className='text-accent-mute text-xs'>{cake.client}</h5>

			{/* Cake Details */}
			<div className='flex mt-4'>
				<h5 className='basis-1/5 text-center font-bold text-md'>
					{cake.cake.amount}x
				</h5>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>{cake.cake.name}</h5>
					<h5 className='text-xs text-accent-mute'>Flavor: {cake.cake.flavor}</h5>
					<h5 className='text-xs text-accent-mute'>Finish: {cake.cake.finish}</h5>
					<h5 className='text-xs text-accent-mute'>Filling: {cake.cake.filling}</h5>
					<h5 className='text-xs text-accent-mute'>Shape: {cake.cake.shape}</h5>
					<h5 className='text-xs text-accent-mute'>Inscription: {cake.cake.inscription}</h5>
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
					<h5 className='text-xs text-accent-mute'>Flavor: {cake.cupcake.flavor}</h5>
					<h5 className='text-xs text-accent-mute'>Finish: {cake.cupcake.finish}</h5>
				</div>
			</div>
			}
		</div>
	)

	return (
		<div className='grid grid-cols-5 gap-4'>
			{listOrder}
		</div>
	)
}

export default QueuePending