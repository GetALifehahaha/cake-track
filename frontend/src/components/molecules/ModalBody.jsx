import React from 'react'
import { cn } from '@/utils/cn'

const ModalBody = ({ children, className }) => {
  return (
    <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
      <div className={cn('p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] max-w-[90vw] max-h-[80vh] flex flex-col gap-10', className)}>
        {children}
      </div>
    </div>
  )
}

export default ModalBody