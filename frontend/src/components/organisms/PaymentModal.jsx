import React, { useMemo, useState } from 'react';
import { Button, Label, Title } from '../atoms';
import { ModalFeedbackCard, ModalPriceCard, ModalSelectionCard } from '../molecules';
import { X } from 'lucide-react';

const PaymentModal = ({totalPrice, onConfirm}) => {

    const [receivedPayment, setReceivedPayment] = useState(0);
    const [isExact, setIsExact] = useState(false);
    const [showModalFeedback, setShowModalFeedback] = useState(false);
    const [modalFeedbackContent, setModalFeedbackContent] = useState({type: "", label: "", details: ""})

    const [quickSelectAmounts, setQuickSelectAmounts] = useState([
        {value: 50, selected: false},
        {value: 100, selected: false},
        {value: 200, selected: false},
        {value: 500, selected: false},
        {value: 1000, selected: false},
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

            qsa.forEach(({value, selected}) => {
                if (value == amount) {selected = !selected;}
                else {selected = false;}

                selectAmounts.push({value, selected});
            })


            return selectAmounts;

        })
    }

    const handleSetReceivedPayment = (e) => {
        e.preventDefault();
        setReceivedPayment(e.target.value);
        handleRenderSelectAmount(0);
        setIsExact(true);
    }

    useMemo(() => {
        if (receivedPayment >= totalPrice) {
            setModalFeedbackContent({type: "success", label: "Change Due", details: '₱' + Number(receivedPayment - totalPrice).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})})
            setShowModalFeedback(true);
        } else {
            setShowModalFeedback(false);
        }
    }, [receivedPayment])

    const handleToggleExact = () => {
        setIsExact(!isExact);
        setReceivedPayment(rp => {
            let payment = rp;

            if ([50, 200, 500, 1000].some((element) => {payment == element})) {
                return 0;
            }

            return payment;
        });
        handleRenderSelectAmount(0);
    }

    const handleConfirmModal = (value) => {

        if (!value) onConfirm(false);

        if (receivedPayment < totalPrice) {
            setModalFeedbackContent({type: "error", label: "Insufficient", details: 'Short ₱' + Number(totalPrice - receivedPayment).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})});
            setShowModalFeedback(true);

            return;
        }

        onConfirm(value);
    }

    const listQuickSelectAmounts = quickSelectAmounts.map(({value, selected}, index) => 
        <ModalSelectionCard key={index} value={value} selected={selected} onClick={handleQuickSelectAmount}/>
    )

    return (
        <div className='absolute top-0 left-0 w-full h-screen flex justify-center items-center z-1000'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
            {/* Header */}
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='Cash Payment' />
                    <X size={16} className='text-text cursor-pointer' onClick={() => handleConfirmModal(false)}/>
                </div>

                <div className='w-full flex gap-1'>
                    <ModalPriceCard text='Total Due' amount={totalPrice} />
                    <ModalPriceCard text='Received' amount={receivedPayment} />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label variant='small' text='Quick Select'/>
                    <div className='flex gap-2'>
                        {listQuickSelectAmounts}
                        <ModalSelectionCard value={0} selected={isExact} onClick={handleToggleExact}/>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <Label variant='small' text='Or Enter Amount'/>
                    <input type='number' min={0} maxLength={11} value={receivedPayment} onChange={(e) => handleSetReceivedPayment(e)} className={`focus:outline-none p-4 rounded-lg border-main-dark/50 border  ${(isExact) ? '' : 'bg-main-dark/50'}`}/>
                </div>

                { showModalFeedback &&
                    <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                }

                <div className='flex gap-4'>
                    <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={() => handleConfirmModal(false)}/>
                    <Button variant='modalBlock' size='modalSize' text='Complete Payment' onClick={() => handleConfirmModal(true)}/>
                </div>
            </div>
        </div>
    )
}

export default PaymentModal;