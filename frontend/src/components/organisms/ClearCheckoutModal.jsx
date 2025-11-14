import React, { useState } from 'react';
import { Button } from '../atoms';
import { ModalFeedbackCard } from '../molecules';
import { Lock, X } from 'lucide-react';

const ClearCheckoutModal = ({onConfirm}) => {

    const actualAccessCode = 1234;
    const [accessCode, setAccessCode] = useState();
    const [modalFeedbackContent, setModalFeedbackContent] = useState({});
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const confirmAccessCode = () => {
        if (accessCode != actualAccessCode) {
            setModalFeedbackContent({
                type: "error",
                label: "Wrong Access Code",
                details: "Please enter the correct access code"
            })
            setShowModalFeedback(true);
            return;
        }

        onConfirm(true);
    }

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-1000'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <X size={16} className='text-text cursor-pointer ml-auto' onClick={() => onConfirm(false)}/>

                <div className='flex flex-col justify-center items-center gap-4'>
                    <div className='bg-accent-mute/20 text-accent-mute p-4 rounded-full w-fit'>
                        <Lock size={36}/>
                    </div>
                    <h5 className='font-bold text-xl'>Access Code Required</h5>
                    <h5 className='text-text/75 font-medium'>Enter the 4-digit access code to void this order</h5>
                </div>

                <input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} type='number' maxLength={4} className='mx-auto bg-accent-mute/20 p-4 rounded-xl border-4 border-border font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute' placeholder='ENTER CODE'/>

                { showModalFeedback &&
                    <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                }

                <div className='flex gap-4'>
                    <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={() => onConfirm(false)}/>
                    <Button variant='modalBlock' size='modalSize' text='Verify' onClick={confirmAccessCode}/>
                </div>
            </div>
        </div>
    )
}

export default ClearCheckoutModal;