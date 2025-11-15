import React from 'react'
import { Title } from '../../components/atoms'

const QueueCompleted = () => {

	const completedTransactions = [
		{
			id: '0112',
			fullName: "Maria Antoniette Clairesse Gurain",
			cakeFlavor: "Chocolate",
			occation: "Birthday",
			placementDate: "October 20, 2025",
			dueDate: "October 25, 2025",
		}
	]

	const listCompletedTransactions = completedTransactions.map((item, index) => 
		<div className='flex w-full text-sm' key={index}>
            <h5 className={`text-text font-medium text-center py-0.5 flex-1`}>{item.id}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 flex-1`}>{item.fullName}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 flex-1`}>{item.cakeFlavor}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 flex-1`}>{item.occation}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 flex-1`}>{item.placementDate}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 flex-1`}>{item.dueDate}</h5>
        </div>
	)

	return (
		<div className='w-full p-4 border-border border-2 rounded-xl'>
			<div className='pb-4'>
				<Title variant='table' text='Completed Transactions' />
			</div>
			<div className='flex flex-row items-center bg-accent-mute rounded-t-xl'>
				<h5 className={`text-white font-medium text-center py-2 flex-1`}>ID</h5>
				<h5 className={`text-white font-medium text-center py-2 flex-1`}>Name</h5>
				<h5 className={`text-white font-medium text-center py-2 flex-1`}>Cake Flavor</h5>
				<h5 className={`text-white font-medium text-center py-2 flex-1`}>Cake Occation</h5>
				<h5 className={`text-white font-medium text-center py-2 flex-1`}>Placement Date</h5>
				<h5 className={`text-white font-medium text-center py-2 flex-1`}>Due Date</h5>
			</div>
			<div className='flex flex-col items-center gap-2 py-2'>
				{listCompletedTransactions}
			</div>
		</div>
  	)
}

export default QueueCompleted