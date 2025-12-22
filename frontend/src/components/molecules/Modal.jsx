import React from 'react'
import { cn } from '@/utils/cn'
import { Title } from '../atoms'
import { X } from 'lucide-react'

const Modal = ({children, className="", title="", onClose}) => {
  	return (
    	<div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
			<div className={cn('p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] max-w-[90vw] max-h-[80vh] flex flex-col gap-10', className)}>
				<div className='flex justify-between items-center w-full'>
					<Title variant='modal' text={title} />
					<X size={16} className='text-text cursor-pointer' onClick={onClose}/>
				</div>
				{children}
			</div>
		</div>
  	)
}

export default Modal