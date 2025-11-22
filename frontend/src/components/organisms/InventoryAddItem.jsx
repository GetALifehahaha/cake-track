import React, { useEffect, useState } from 'react';
import { Title, Label, Button, Dropdown } from '../atoms';
import { DatePicker, ModalFeedbackCard } from '../molecules';
import { X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const InventoryAddItem = ({onConfirm, onClose}) => {


    const units = [
        { key: 'Pieces', value: 'pc' },
        { key: 'Kilograms', value: 'kg' },
        { key: 'Grams', value: 'g' },
        { key: 'Sticks', value: 'st' },
        { key: 'Milliliter', value: 'ml' },
        { key: 'Cup', value: 'cup' }
    ];

    const [name, setName] = useState("");
    const [amount, setAmount] = useState(0);
    const [unit, setUnit] = useState(null);
    const [purchaseDate, setPurchaseDate] = useState();
    const [expirationDate, setExpirationDate] = useState();
    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConfirm = () => {
        onConfirm({name, amount, unit, purchaseDate: purchaseDate.toLocaleDateString("en-CA"), expirationDate: expirationDate.toLocaleDateString("en-CA")});
    }

    const handleSetUnit = (value) => {
        setUnit(value)
    }

    const handleSetShowConfirm = () => {
        if (!name || !amount || !unit || !purchaseDate || !expirationDate) {
            setModalFeedbackContent({type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.`})
            return;
        }
        
        if (expirationDate < purchaseDate) {
            setModalFeedbackContent({type: "error", label: "Invalid Expiration Date", details: 'Expiry date cannot be earlier than the purchase date.'})
            return;
        }
        setShowConfirm(true)
    };
    const handleSetCloseConfirm = () => setShowConfirm(false);

    useEffect(() => {
        if (modalFeedbackContent) {
            setShowModalFeedback(true);
        } else {
            setModalFeedbackContent(false);
        }
    }, [modalFeedbackContent])

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='Add New Item' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                </div>

                <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Name'/>
                        <input type='text' placeholder='Enter item name' value={name} onChange={(e) => setName(e.target.value)} 
                                className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                    </div>

                    <div className='flex items-center gap-4'>
                        <div className='flex-1 flex flex-col gap-2'>
                            <Label variant='modal' text='Amount'/>
                            <input type='number' value={amount} onChange={(e) => setAmount(e.target.value)} 
                                    className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                        </div>

                        <div className='flex-1 flex flex-col gap-2'>
                            <Label variant='modal' text='Unit'/>
                            <Dropdown size='full' variant='modal' value={unit} selection="e.g., Kilograms" options={units} onSelect={handleSetUnit} />
                        </div>
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Purchase Date'/>
                        <DatePicker selected={purchaseDate} onSelect={setPurchaseDate} />
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Expiration Date'/>
                        <DatePicker selected={expirationDate} onSelect={setExpirationDate} />
                    </div>

                    { showModalFeedback &&
                        <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                    }

                    <div className='flex gap-4 mt-4 ml-auto'>
                        <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={onClose}/>
                        <Button variant='modalBlock' size='modalSize' text='Add Item' onClick={handleSetShowConfirm}/>
                    </div>
                </div>
            </div>

            {showConfirm &&
                <ConfirmationModal title={"Add Item?"} content={"Are you sure you want to add this item?"} onReject={handleSetCloseConfirm} onConfirm={handleConfirm} />
            }
        </div>
    )
}

export default InventoryAddItem;