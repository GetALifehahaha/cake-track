import React, { useState } from 'react';
import { Title, Label, Button } from '../atoms';
import { cn } from '@/utils/cn';

const ConfirmationModal = ({title, content, onConfirm, onReject, confirmText="Confirm", cancelText="Cancel"}) => {
    const [closing, setClosing] = useState(false);

    const handleReject = () => {
        setClosing(true);
        setTimeout(() => onReject(), 150);
    };

    const handleConfirm = () => {
        setClosing(true);
        setTimeout(() => onConfirm(), 150);
    };

    return (
         <div className={cn(
            'absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10',
            !closing ? 'animate-in fade-in duration-150' : 'animate-out fade-out duration-150 fill-mode-forwards'
         )}>
            <div className={cn(
                'p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10',
                !closing ? 'animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-150' : 'animate-out fade-out zoom-out-95 slide-out-to-bottom-3 duration-150 fill-mode-forwards'
            )}>
                <div className='flex flex-col gap-2'>
                    <Title variant='modal' text={title} />
                    <h5 className='text-text/75 py-4'>{content}</h5>
                    <div className='flex flex-row ml-auto gap-2'>
                        <Button text={cancelText} onClick={handleReject} variant='modalOutline' />
                        <Button text={confirmText} onClick={handleConfirm} variant='modalBlock' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal;