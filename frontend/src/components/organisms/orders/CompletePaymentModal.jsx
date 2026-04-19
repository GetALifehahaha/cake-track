import React, { useState, useMemo } from 'react';
import { Button, Label, Title } from '../../atoms';
import { ModalFeedbackCard, ModalPriceCard } from '../../molecules';
import { X } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import { cn } from '@/utils/cn';

const CompletePaymentModal = ({ order, onConfirm, onClose }) => {

    const isPremade = String(order?.cake_orders?.occasion || '').toLowerCase() === 'pre-made';

    // For premade: remaining is total - 15% downpayment (or recorded downpayment if present)
    // For custom: remaining is total - 500 downpayment (or recorded downpayment if present)
    const normalizedPayments = (order.payments || []).filter(payment => {
        const status = String(payment?.status || '').toLowerCase();
        return status === 'success' || status === 'completed' || status === 'paid';
    });
    const recordedDownpayment = normalizedPayments.find(payment => String(payment?.payment_type || '').toLowerCase() === 'downpayment');

    const [totalPrice, setTotalPrice] = useState(Number(order?.total_price || 0));
    const [amountReceived, setAmountReceived] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showModalFeedback, setShowModalFeedback] = useState(false);
    const [modalFeedbackContent, setModalFeedbackContent] = useState({ type: "", label: "", details: "" });
    const [closing, setClosing] = useState(false);

    const totalPriceNumber = Number(totalPrice) || 0;
    const expectedDownpayment = isPremade ? totalPriceNumber * 0.15 : 500;
    const downpaymentAmount = Number(recordedDownpayment?.amount || expectedDownpayment || 0);
    const effectiveDownpayment = Math.min(downpaymentAmount, totalPriceNumber);

    const remainingBalance = useMemo(() => {
        return Math.max(totalPriceNumber - effectiveDownpayment, 0);
    }, [totalPriceNumber, effectiveDownpayment]);

    const formatCurrency = (value) => Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleTotalPriceChange = (e) => {
        const raw = e.target.value;
        if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
        if (raw.length > 13) return;
        setTotalPrice(raw);
    };

    const handleAmountReceivedChange = (e) => {
        const raw = e.target.value;
        if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
        if (raw.length > 13) return;
        setAmountReceived(raw);
    };

    useMemo(() => {
        const received = Number(amountReceived) || 0;
        if (received >= remainingBalance && remainingBalance > 0) {
            setModalFeedbackContent({
                type: "success",
                label: "Change Due",
                details: '₱' + formatCurrency(received - remainingBalance)
            });
            setShowModalFeedback(true);
        } else {
            setShowModalFeedback(false);
        }
    }, [amountReceived, remainingBalance]);

    const handleShowConfirmation = () => {
        const received = Number(amountReceived) || 0;

        if (!isPremade && (Number(totalPrice) || 0) <= 0) {
            setModalFeedbackContent({ type: "error", label: "Invalid", details: "Please enter the total price for this order." });
            setShowModalFeedback(true);
            return;
        }

        if (received < remainingBalance) {
            setModalFeedbackContent({
                type: "error",
                label: "Insufficient",
                details: 'Short ₱' + formatCurrency(remainingBalance - received)
            });
            setShowModalFeedback(true);
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        const payload = {
            status: "completed",
            amount_received: Number(amountReceived),
        };

        // For custom orders, send total_price so backend can set it
        if (!isPremade) {
            payload.total_price = Number(totalPrice);
        }

        onConfirm(order.id, payload);
    };

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => onClose(), 150);
    };

    return (
        <div className={cn(
            'absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10',
            !closing ? 'animate-in fade-in duration-150' : 'animate-out fade-out duration-150 fill-mode-forwards'
        )}>
            <div className={cn(
                'p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-6',
                !closing ? 'animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-150' : 'animate-out fade-out zoom-out-95 slide-out-to-bottom-3 duration-150 fill-mode-forwards'
            )}>
                {/* Header */}
                <div className='flex justify-between items-center w-full'>
                    <div>
                        <Title variant='modal' text='Complete Order' />
                        <h5 className='text-text/50 text-sm font-medium'>Order {order.id} — {order.full_name}</h5>
                    </div>
                    <X size={16} className='text-text cursor-pointer' onClick={handleClose} />
                </div>

                {/* For custom orders: allow setting/updating total price before completion */}
                {!isPremade && (
                    <div className='flex flex-col gap-2'>
                        <Label variant='small' text='Set Total Price' />
                        <input
                            type='text'
                            placeholder='0.00'
                            value={totalPrice || ''}
                            onChange={handleTotalPriceChange}
                            className='focus:outline-none p-4 rounded-lg border-main-dark/50 border'
                        />
                    </div>
                )}

                {/* Price Summary */}
                <div className='w-full flex gap-1'>
                    <ModalPriceCard text='Total Price' amount={totalPrice} />
                    <ModalPriceCard text='Downpayment' amount={downpaymentAmount} />
                    <ModalPriceCard text='Remaining' amount={remainingBalance} />
                </div>

                {/* Amount Received */}
                <div className='flex flex-col gap-2'>
                    <Label variant='small' text='Amount Received' />
                    <input
                        type='text'
                        placeholder='0.00'
                        value={amountReceived || ''}
                        onChange={handleAmountReceivedChange}
                        className='focus:outline-none p-4 rounded-lg border-main-dark/50 border'
                    />
                </div>

                {/* Feedback */}
                {showModalFeedback &&
                    <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                }

                {/* Actions */}
                <div className='flex gap-4'>
                    <Button variant='modalOutline' size='full' text='Cancel' onClick={handleClose} />
                    <Button variant='modalBlock' size='full' text='Complete Order' onClick={handleShowConfirmation} />
                </div>

                {showConfirmation &&
                    <ConfirmationModal
                        title="Confirm Completion"
                        content={`Complete this order and collect ₱${formatCurrency(remainingBalance)}?`}
                        onConfirm={handleConfirm}
                        onReject={() => setShowConfirmation(false)}
                    />
                }
            </div>
        </div>
    );
};

export default CompletePaymentModal;
