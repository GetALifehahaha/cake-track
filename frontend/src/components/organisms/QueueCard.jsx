import React, { useState } from 'react';
import { Button } from '../atoms';
import { Ellipsis } from 'lucide-react';

const QueueCard = ({order, onAccept, onReject}) => {

    const [showOptions, setShowOptions] = useState(false);

    return (
        <div className='rounded-lg border border-border p-6 bg-main-white relative cursor-pointer hover:shadow-md min-h-80'>
            {showOptions &&
                <div className='absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center gap-6 z-10'>
                    <Button variant='success' text='ACCEPT' onClick={() => {onAccept(order.id); setShowOptions(false);}}/>
                    <Button variant='error' text='DECLINE' onClick={() => {onReject(order.id); setShowOptions(true)}}/>
                    <Button variant='outline' text='Close' onClick={() => setShowOptions(false)}/>
                </div>
            }
			<div className='flex justify-between items-center'>
				<h5 className='text-accent-text text-sm'>Order {order.id}</h5>
                <Ellipsis onClick={() => setShowOptions(true)} className='cursor-pointer' size={16} />
			</div>
			<h5 className='text-accent-text text-xs'>{order.client}</h5>

			{/* Cake Details */}
			<div className='flex mt-4'>
				<h5 className='basis-1/5 text-center font-bold text-md'>
					{order.cake.amount}x
				</h5>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>{order.cake.name}</h5>
					<h5 className='text-xs text-accent-text'>Flavor: {order.cake.flavor}</h5>
					<h5 className='text-xs text-accent-text'>Finish: {order.cake.finish}</h5>
					<h5 className='text-xs text-accent-text'>Filling: {order.cake.filling}</h5>
					<h5 className='text-xs text-accent-text'>Shape: {order.cake.shape}</h5>
					<h5 className='text-xs text-accent-text'>Inscription: {order.cake.inscription}</h5>
				</div>
			</div>

			{/* Cupcake if there's any */}
			{order.cupcake && 
			<div className='flex mt-2 mb-4'>
				<h5 className='basis-1/5 text-center font-bold text-md'>
					{order.cupcake.amount}x
				</h5>
				<div className='flex flex-col gap-0.5'>
					<h5 className='font-bold text-md'>Cupcakes</h5>
					<h5 className='text-xs text-accent-text'>Flavor: {order.cupcake.flavor}</h5>
					<h5 className='text-xs text-accent-text'>Finish: {order.cupcake.finish}</h5>
				</div>
			</div>
			}
		</div>
    )
}

export default QueueCard;