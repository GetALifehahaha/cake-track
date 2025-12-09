import React, { useState } from 'react'
import ModalBody from '../molecules/ModalBody'
import { Button, Title } from '../atoms';
import { X } from 'lucide-react';
import ConfirmationModalWrapper from './ConfirmationModalWrapper';

const InputRejectModal = ({ onConfirm, onReject }) => {

    const [reason, setReason] = useState("");
    const [feedback, setFeedback] = useState("");

    return (
        <>
            <ModalBody>
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='Reject Reason' />
                    <X size={16} className='text-text cursor-pointer' onClick={onReject} />
                </div>

                <textarea rows={6} className='w-full bg-main-white focus:outline-none border-2 p-2 border-main-dark rounded-sm' value={reason} onChange={(e) => setReason(e.target.value)} placeholder='What is the reason you decline?'>

                </textarea>

                <div className='flex items-center ml-auto gap-2'>
                    <Button variant='modalOutline' onClick={onReject} text='Cancel' />
                    <ConfirmationModalWrapper
                        title='Decline order'
                        content='Are you sure you want to decline?'
                        onConfirm={() => onConfirm(reason)}
                    >
                        <h5 className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-text w-fit text-base cursor-pointer'>Reject</h5>
                    </ConfirmationModalWrapper>
                </div>
            </ModalBody >
        </>
    )
}

export default InputRejectModal