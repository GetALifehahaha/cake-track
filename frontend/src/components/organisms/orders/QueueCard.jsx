import React, { useState } from 'react';
import { Button } from '@/components/atoms';
import { Ellipsis } from 'lucide-react';
import ConfirmationModalWrapper from '../ConfirmationModalWrapper';
import { InputRejectModalWrapper } from '..';

const QueueCard = ({ order, onShowDetails }) => {

	const [showOptions, setShowOptions] = useState(false);

	const capitalize = (str) => str[0].toUpperCase() + str.slice(1)

	return (
		<div
			className='rounded-lg border border-border p-6 bg-main-white relative hover:shadow-md cursor-pointer min-h-60'
			onClick={() => setShowOptions(!showOptions)}
		>
			{showOptions &&
				<div
					className='absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center gap-6 z-10'
					onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions) }}
				>
					<ConfirmationModalWrapper title='Accept order' content={`Confirm acceptance of Order #${order.id}. This action is irreversible and places the order into the active production schedule.`}>
						<h5 className='bg-success text-white px-6 py-3 rounded-lg font-semibold w-fit text-base'>
							ACCEPT
						</h5>
					</ConfirmationModalWrapper>
					<InputRejectModalWrapper>
						<Button variant='error' text='DECLINE' />
					</InputRejectModalWrapper>
				</div>
			}
			<div className='flex justify-between items-center'>
				<h5 className='text-accent-text text-sm'>Order {order.id}</h5>
				<Ellipsis
					onClick={(e) => {
						e.stopPropagation();
						onShowDetails(order);
					}}
					className='cursor-pointer'
					size={16}
				/>
			</div>
			<h5 className='text-accent-text text-xs'>{order.client}</h5>

			{/* Cake Details */}
			<div className='flex mt-4'>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>{capitalize(order.cake_orders.occassion)}</h5>
					<h5 className='text-xs text-accent-text'>Flavor: {capitalize(order.cake_orders.base_flavor)}</h5>
					<h5 className='text-xs text-accent-text'>Finish: {capitalize(order.cake_orders.finish)}</h5>
					<h5 className='text-xs text-accent-text'>Filling: {capitalize(order.cake_orders.filling)}</h5>
					<h5 className='text-xs text-accent-text'>Shape: {capitalize(order.cake_orders.shape)}</h5>
					<h5 className='text-xs text-accent-text'>Inscription: {capitalize(order.cake_orders.message_type)}</h5>
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
						<h5 className='text-xs text-accent-text'>Flavor: {order.cupcake_orders.flavor}</h5>
						<h5 className='text-xs text-accent-text'>Finish: {order.cupcake_orders.finish}</h5>
					</div>
				</div>
			}
		</div>
	)
}

export default QueueCard;