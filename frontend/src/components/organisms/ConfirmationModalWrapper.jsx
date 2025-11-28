import React, { useState } from 'react'
import { Title, Button } from '../atoms';

const ConfirmationModalWrapper = ({ children, onConfirm, onReject, title = "Title", content = 'Content' }) => {

    const [show, setShow] = useState(false);

    const handleConfirm = () => {
        setShow(false);
        onConfirm();
    }

    const handleReject = () => setShow(false);

    return (
        <>
            <button onClick={() => setShow(!show)}>
                {children}
            </button>

            {show &&
                <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
                    <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 max-w-[30vw] flex flex-col gap-10'>
                        <div className='flex flex-col gap-2'>
                            <Title variant='modal' text={title} />
                            <h5 className='text-text/75 py-4 text-md'>{content}</h5>
                            <div className='flex flex-row ml-auto gap-2'>
                                <Button text='Cancel' onClick={handleReject} variant='modalOutline' />
                                <Button text='Confirm' onClick={handleConfirm} variant='modalBlock' />
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default ConfirmationModalWrapper