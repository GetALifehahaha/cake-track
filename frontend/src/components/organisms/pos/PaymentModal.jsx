import React, { useEffect, useState } from 'react';
import { Button, Label, Title } from '../../atoms';
import { ModalFeedbackCard, ModalPriceCard, ModalSelectionCard } from '../../molecules';
import { X } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';

const PaymentModal = ({ totalPrice, customerName = '', onCustomerNameChange, onConfirm, onClose }) => {

    const [receivedPayment, setReceivedPayment] = useState(0);
    const [isExact, setIsExact] = useState(false);
    const [showModalFeedback, setShowModalFeedback] = useState(false);
    const [modalFeedbackContent, setModalFeedbackContent] = useState({ type: "", label: "", details: "" })
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [quickSelectAmounts, setQuickSelectAmounts] = useState([
        { value: 50, selected: false },
        { value: 100, selected: false },
        { value: 200, selected: false },
        { value: 500, selected: false },
        { value: 1000, selected: false },
    ]);

    const handleQuickSelectAmount = (amount) => {
        setReceivedPayment(received => {
            if (received === amount) return 0;

            return amount;
        });

        handleRenderSelectAmount(amount);
        setIsExact(false);
    }

    const handleRenderSelectAmount = (amount) => {
        setQuickSelectAmounts(qsa => {
            let selectAmounts = [];

            qsa.forEach(({ value, selected }) => {
                if (value == amount) { selected = !selected; }
                else { selected = false; }

                selectAmounts.push({ value, selected });
            })


            return selectAmounts;

        })
    }

    const handleSetReceivedPayment = (e) => {
        e.preventDefault();

        const raw = e.target.value

        if (!/^\d*\.?\d{0,2}$/.test(raw)) return

        if (e.target.value.length > 13) return;

        setReceivedPayment(e.target.value);
        handleRenderSelectAmount(0);
        setIsExact(true);
    }

    const handleSetShowConfirmationModal = () => {
        const paymentAmount = Number(receivedPayment || 0);

        if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
            setModalFeedbackContent({ type: "error", label: "Invalid Payment", details: 'Please enter a valid payment amount.' });
            setShowModalFeedback(true);

            return;
        }

        if (paymentAmount < totalPrice) {
            setModalFeedbackContent({ type: "error", label: "Insufficient", details: 'Short ₱' + Number(totalPrice - paymentAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
            setShowModalFeedback(true);

            return;
        }
        setShowConfirmation(true);
    }
    const handleSetCloseConfirmationModal = () => setShowConfirmation(false)

    useEffect(() => {
        const paymentAmount = Number(receivedPayment || 0);

        if (Number.isFinite(paymentAmount) && paymentAmount >= totalPrice) {
            setModalFeedbackContent({ type: "success", label: "Change Due", details: '₱' + Number(paymentAmount - totalPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })
            setShowModalFeedback(true);
        } else {
            setShowModalFeedback(false);
        }
    }, [receivedPayment, totalPrice])

    const handleToggleExact = () => {
        setIsExact(!isExact);
        setReceivedPayment(totalPrice);
        handleRenderSelectAmount(0);
    }

    const handleConfirmModal = (value) => {
        if (!value) {
            onConfirm(false);
            return;
        }

        onConfirm({
            receivedPayment: Number(receivedPayment || 0),
            customerName: customerName?.trim() || null,
        });
    }

    const listQuickSelectAmounts = quickSelectAmounts.map(({ value, selected }, index) =>
        <ModalSelectionCard key={index} value={value} selected={selected} onClick={handleQuickSelectAmount} />
    )

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-1000'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                {/* Header */}
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='Cash Payment' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose} />
                </div>

                <div className='w-full flex gap-1'>
                    <ModalPriceCard text='Total Due' amount={totalPrice} />
                    <ModalPriceCard text='Received' amount={receivedPayment} />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label variant='small' text='Quick Select' />
                    <div className='flex gap-2'>
                        {listQuickSelectAmounts}
                        <ModalSelectionCard value={0} selected={isExact} onClick={handleToggleExact} />
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <Label variant='small' text='Or Enter Amount' />
                    <input type='text' min={0} maxLength={11} value={receivedPayment} onChange={(e) => handleSetReceivedPayment(e)} className={`focus:outline-none p-4 rounded-lg border-main-dark/50 border  ${(isExact) ? '' : 'bg-main-dark/50'}`} />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label variant='small' text='Customer Name (Optional)' />
                    <input
                        type='text'
                        value={customerName}
                        onChange={(e) => onCustomerNameChange?.(e.target.value)}
                        placeholder='Enter customer name'
                        className='focus:outline-none p-3 rounded-lg border-main-dark/50 border bg-main-white'
                    />
                </div>

                {showModalFeedback &&
                    <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                }

                <div className='flex gap-4'>
                    <Button variant='modalOutline' size='full' text='Cancel' onClick={onClose} />
                    <Button variant='modalBlock' size='full' text='Complete Payment' onClick={handleSetShowConfirmationModal} />
                </div>

                {showConfirmation &&
                    <ConfirmationModal title="Confirm Payment" content="Finish payment?" onConfirm={() => handleConfirmModal(true)} onReject={handleSetCloseConfirmationModal} />
                }
            </div>
        </div>
    )
}

export default PaymentModal;