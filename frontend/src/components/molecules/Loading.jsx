import { LoaderCircle } from 'lucide-react'
import React from 'react'

const Loading = () => {
    return (
        <div className='absolute top-0 left-0 w-full h-20 flex justify-center items-center'>
            <div className='p-2 rounded-full flex justify-center items-center bg-white border-main-dark border'>
                <LoaderCircle className='animate-spin text-accent' />
            </div>
        </div>
    )
}

export default Loading