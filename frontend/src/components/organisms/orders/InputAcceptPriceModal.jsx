import React, { useState } from 'react';
import { Button } from '@/components/atoms';
import { ModalBody, ModalFeedbackCard } from '@/components/molecules';

const formatMoneyInput = (value = '') => {
    const normalized = String(value).replace(/[^\d.]/g, '');

    if (normalized.split('.').length > 2) {
        return normalized.slice(0, -1);
    }

    if (!/^\d*\.?\d{0,2}$/.test(normalized)) {
        return normalized.slice(0, -1);
    }

    return normalized.slice(0, 13);
};

const InputAcceptPriceModal = ({ order, onConfirm, onReject }) => {
    const [totalPrice, setTotalPrice] = useState(() => {
        const value = Number(order?.total_price || 0);
        return value > 0 ? String(value.toFixed(2)) : '';
    });
    const [feedback, setFeedback] = useState(null);

    const handleConfirm = () => {
        const parsedPrice = Number(totalPrice || 0);

        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            setFeedback({
                type: 'error',
                label: 'Invalid price',
                details: 'Please enter a valid total price greater than 0.',
            });
            return;
        }

        setFeedback(null);
        onConfirm(parsedPrice);
    };

    return (
        <ModalBody
            title='Accept Order'
            subtitle={`Order ${order?.id || ''} - ${order?.full_name || ''}`}
            onClose={onReject}
            className='min-w-[36vw]'
        >
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <h5 className='text-sm font-medium text-text/80'>Negotiated Total Price</h5>
                    <input
                        type='text'
                        value={totalPrice}
                        onChange={(event) => setTotalPrice(formatMoneyInput(event.target.value))}
                        placeholder='0.00'
                        className='focus:outline-none p-4 rounded-lg border-main-dark/50 border'
                    />
                    <h5 className='text-xs text-text/60'>Set the agreed total amount before moving this order to Accepted.</h5>
                </div>

                {feedback && (
                    <ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
                )}

                <div className='flex items-center ml-auto gap-2'>
                    <Button variant='modalOutline' text='Cancel' onClick={onReject} />
                    <Button variant='modalBlock' text='Accept Order' onClick={handleConfirm} />
                </div>
            </div>
        </ModalBody>
    );
};

export default InputAcceptPriceModal;
