import React, { useEffect, useState } from 'react';
import { Title, Label, Button } from '../atoms';
import { ModalFeedbackCard } from '../molecules';
import { X } from 'lucide-react';

const InventoryAddItem = ({onConfirm}) => {

    const date = new Date();
    const placeholderDate = `${date.getFullYear()}-${date.getDate()}-${date.getMonth()+1}`
    const units = {
        Pieces: 'pcs',
        Kilograms: "kg",
        Sticks: 'stk',
        Milliliter: "ml",
    }

    const [name, setName] = useState("");
    const [amount, setAmount] = useState(0);
    const [unit, setUnit] = useState("kg");
    const [purchaseDate, setPurchaseDate] = useState();
    const [expirationDate, setExpirationDate] = useState();
    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const handleConfirm = (value) => {
        if (value) {
            if (!name || !amount || !unit || !purchaseDate || !expirationDate) {
                setModalFeedbackContent({type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.`})
                return;
            }
            
            if (expirationDate < purchaseDate) {
                setModalFeedbackContent({type: "error", label: "Invalid Expiration Date", details: 'Expiry date cannot be earlier than the purchase date.'})
                return;
            }

            onConfirm({name, amount, unit, purchaseDate, expirationDate});
        }

        onConfirm(value)
    }

    useEffect(() => {
        if (modalFeedbackContent) {
            setShowModalFeedback(true);
        } else {
            setModalFeedbackContent(false);
        }
    }, [modalFeedbackContent])


    const listUnits = Object.entries(units).map(([key, value], index) => <option key={index} value={value}>{`${key} (${value})`}</option>)

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-1000'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex justify-between items-center w-full'>
                    <Title variant='modal' text='Add New Item' />
                    <X size={16} className='text-text cursor-pointer' onClick={() => onConfirm(false)}/>
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
                            <select className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' onChange={(e) => setUnit(e.target.value)}>
                                {listUnits}
                            </select>
                        </div>
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Purchase Date'/>
                        <input type='date' value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} 
                                className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <Label variant='modal' text='Expiration Date'/>
                        <input type='date' value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} 
                                className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                    </div>

                    { showModalFeedback &&
                        <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                    }

                    <div className='flex gap-4 mt-4 ml-auto'>
                        <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={() => handleConfirm(false)}/>
                        <Button variant='modalBlock' size='modalSize' text='Add Item' onClick={() => handleConfirm(true)}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InventoryAddItem;