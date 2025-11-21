import React from 'react';
import { Title, Label, Button } from '../atoms';

const ConfirmationModal = ({title, content, onConfirm, onReject}) => {
    return (
         <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex flex-col gap-2'>
                    <Title variant='modal' text={title} />
                    <h5 className='text-text/75 py-4'>{content}</h5>
                    <div className='flex flex-row ml-auto gap-2'>
                        <Button text='Cancel' onClick={onReject} variant='modalOutline' />
                        <Button text='Add Product' onClick={onConfirm} variant='modalBlock' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal;