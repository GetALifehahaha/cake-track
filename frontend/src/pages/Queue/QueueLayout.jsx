import React, { useState } from 'react'
import { Title } from '../../components/atoms'
import { Clock4, LayoutGrid, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'

const Queue = () => {

	const navigate = useNavigate();
	const [tab, setTab] = useState("Overview")

	const queueTabs = [
		{label: "Overview", path: '', icon: LayoutGrid},
		{label: "Pending", path: '/pending', icon: Clock4},
		{label: "Accepted", path: '/accepted', icon: CheckCircle},
		{label: "Completed", path: '/completed', icon: XCircle},
	]

	const acceptedOrdersHeaders = [
		"ID", "Name", "Cake Flavor", "w/ Cupcake", "Placement Order", "Due Date"
	]

	// dummy data
	const activeIndicator = 'before:content-[""] before:absolute before:w-full before:h-1 before:bottom-0 before:left-0 before:bg-accent-mute'

	const listTabs = queueTabs.map(({label, path, icon: Icon}, index) => <span key={index} className={`relative text-text text-sm flex items-center gap-2 cursor-pointer px-3 py-1 rounded-sm hover:bg-main-dark/50 ${tab==label ? activeIndicator : ''}`} onClick={() => navigate(`/queue${path}`)}><Icon size={16} /> <h5>{label}</h5></span>)

	return (
		<div className='flex flex-col gap-8'>
			<Title variant='page' text='Custom Order Queue'/>
			<div className='flex items-center border-b-2 border-b-border w-fit'>
				{listTabs}
			</div>

			<Outlet />
		</div>

	)
}

export default Queue

			
		

			// tab == "Pending" && 
			// 	<div></div>
			