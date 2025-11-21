import React from 'react'

const ModalBody = ({children}) => {
  return (
    <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
        <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
          {children}
        </div>
    </div>
  )
}

export default ModalBody