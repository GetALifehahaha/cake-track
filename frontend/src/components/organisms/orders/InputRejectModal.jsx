import React, { useState } from 'react'
import { Button } from '@/components/atoms';
import ConfirmationModalWrapper from '../ConfirmationModalWrapper';
import { ModalFeedbackCard, ModalBody } from '@/components/molecules';

const InputRejectModal = ({ onConfirm, onReject }) => {

    const [reason, setReason] = useState("");

    const [feedback, setFeedback] = useState(null);

    const confirmReject = () => {
        if (reason.length < 8) {
            setFeedback({
                label: 'Invalid reason',
                details: "Please provide a valid reason for rejection",
                type: 'error'
            })
            return;
        }

        setFeedback(null);
        onConfirm(reason);
    }

    return (
        <>
            <ModalBody title='Reject Reason' onClick={onReject}>
                <textarea rows={6} className='w-full bg-main-white focus:outline-none border-2 p-2 border-main-dark rounded-sm' value={reason} onChange={(e) => setReason(e.target.value)} placeholder='What is the reason you decline?'>

                </textarea>

                {feedback && 
                    <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
                }

                <div className='flex items-center ml-auto gap-2'>
                    <Button variant='modalOutline' onClick={onReject} text='Cancel' />
                    <ConfirmationModalWrapper
                        title='Decline order'
                        content='Are you sure you want to decline?'
                        onConfirm={confirmReject}
                    >
                        <h5 className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-text w-fit text-base cursor-pointer'>Reject</h5>
                    </ConfirmationModalWrapper>
                </div>
            </ModalBody >
        </>
    )
}

export default InputRejectModal