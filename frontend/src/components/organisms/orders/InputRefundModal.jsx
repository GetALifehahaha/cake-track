import React, { useState } from 'react';
import { Button } from '@/components/atoms';
import { ModalBody, ModalFeedbackCard } from '@/components/molecules';

const getReferenceDigits = (value = '') => String(value).replace(/\D/g, '').slice(0, 15);

const formatReferenceNumber = (value = '') => {
    const digits = getReferenceDigits(value);

    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 12) return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;

    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12)}`;
};

const InputRefundModal = ({ order, onConfirm, onReject }) => {
    const [refundReferenceNumber, setRefundReferenceNumber] = useState('');
    const [feedback, setFeedback] = useState(null);
    const refundAccountName = order?.refund_account_name || 'N/A';
    const refundAccountNumber = order?.refund_account_number
        ? formatReferenceNumber(order.refund_account_number)
        : 'N/A';

    const handleConfirm = () => {
        const normalizedReference = getReferenceDigits(refundReferenceNumber);

        if (normalizedReference.length < 13 || normalizedReference.length > 15) {
            setFeedback({
                type: 'error',
                label: 'Invalid reference number',
                details: 'Refund reference number must be 13 to 15 digits.',
            });
            return;
        }

        setFeedback(null);
        onConfirm(normalizedReference);
    };

    return (
        <ModalBody
            title='Refund Order'
            subtitle={`Order ${order?.id} - ${order?.full_name || ''}`}
            onClose={onReject}
            className='min-w-[36vw]'
        >
            <div className='flex flex-col gap-4'>
                <div className='rounded-lg border border-main-dark/20 bg-main p-4'>
                    <h5 className='text-sm font-medium text-text/80'>Customer Refund GCash Details</h5>
                    <p className='text-sm text-text mt-2'>Name: {refundAccountName}</p>
                    <p className='text-sm text-text'>Number: {refundAccountNumber}</p>
                </div>

                <div className='flex flex-col gap-2'>
                    <h5 className='text-sm font-medium text-text/80'>Refund Reference Number</h5>
                    <input
                        type='text'
                        value={refundReferenceNumber}
                        onChange={(e) => setRefundReferenceNumber(formatReferenceNumber(e.target.value))}
                        placeholder='1234 5678 9012 345'
                        maxLength={18}
                        className='focus:outline-none p-4 rounded-lg border-main-dark/50 border'
                    />
                    <h5 className='text-xs text-text/60'>Enter the refund reference number provided by your payment process.</h5>
                </div>

                {feedback && (
                    <ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
                )}

                <div className='flex items-center ml-auto gap-2'>
                    <Button variant='modalOutline' text='Cancel' onClick={onReject} />
                    <Button variant='modalBlock' text='Refund' onClick={handleConfirm} />
                </div>
            </div>
        </ModalBody>
    );
};

export default InputRefundModal;
