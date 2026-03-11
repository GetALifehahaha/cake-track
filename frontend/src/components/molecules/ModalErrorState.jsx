import React from 'react';
import ModalBody from './ModalBody';
import { Button } from '../atoms';
import { AlertTriangle } from 'lucide-react';

const ModalErrorState = ({
    onClose,
    onRetry,
    title = 'Something went wrong',
    details = 'We could not load this section right now.',
}) => {
    const handleReload = () => {
        if (onRetry) {
            onRetry();
            return;
        }

        window.location.reload();
    };

    return (
        <ModalBody title={title} onClose={onClose}>
            <div className='flex flex-col items-center gap-4'>
                <div className='bg-error/10 text-error p-4 rounded-full'>
                    <AlertTriangle size={28} />
                </div>

                <h5 className='text-text/70 text-sm text-center'>{details}</h5>

                <div className='flex gap-3 ml-auto'>
                    <Button variant='modalOutline' size='modalSize' text='Close' onClick={onClose} />
                    <Button variant='modalBlock' size='modalSize' text='Reload' onClick={handleReload} />
                </div>
            </div>
        </ModalBody>
    );
};

export default ModalErrorState;
