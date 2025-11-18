import React, { useState } from 'react';
import { Label, Title, Button, Dropdown,  } from '../atoms';
import { ModalFeedbackCard, DatePicker } from '../molecules';
import { X } from 'lucide-react';

const EditInventoryItem = ({item, onDelete, onConfirm, onClose}) => {
    const units = {
        Pieces: 'pcs',
        Kilograms: "kg",
        Sticks: 'stk',
        Milliliter: "ml",
    }

    const statuses = {
        Good: "good",
        "Out of Stock": "out_of_stock",
        "Running Low": "running_low",
        "Expired": "expired",
    }

    const [name, setName] = useState(item.name)
    const [amount, setAmount] = useState(item.amount);
    const [purchaseDate, setPurchaseDate] = useState(item.purchaseDate);
    const [expirationDate, setExpirationDate] = useState(item.expirationDate);
    const [status, setStatus] = useState();

    const [modalFeedbackContent, setModalFeedbackContent] = useState('');
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const handleConfirm = () => {
        if (!name || !amount || !purchaseDate || !expirationDate || !status) {
            setModalFeedbackContent({type: "error", label: "Incomplete Fields", details: `Please do not leave fields empty.`})
            setShowModalFeedback(true);
            return;
        }

        onConfirm({id: item.id, name, unit: item.unit, amount, purchaseDate, expirationDate, status: capitalize(status)})
    }

    const capitalize = (str) => {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

    return (
        <div className='absolute bg-black/10 backdrop-blur-sm top-0 left-0 w-full h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex flex-col gap-2'>
                    <div className="flex justify-between items-center w-full">
                        <Title variant='modal' text='Action' />
                        <X size={16} className='text-text cursor-pointer' onClick={() => onClose(false)}/>
                    </div>
                    <Label variant='small' text='Modify the product by editing in the detail below or delete the current product.' />
                </div>

                <div className=' flex flex-row gap-8'>
                    <div className='flex-1 flex flex-col gap-2'>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Item Name'/>
                            <input type='text' placeholder='e.g., Chocolate Cake' value={name} onChange={(e) => setName(e.target.value)} 
                                    className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Amount'/>
                            <input type='text' placeholder='e.g., Chocolate Cake' value={amount} onChange={(e) => setAmount(e.target.value)} 
                                    className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Purchase Date'/>
                            <DatePicker selected={purchaseDate} onSelect={setPurchaseDate} />
                        </div>
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Purchase Date'/>
                            <DatePicker selected={expirationDate} onSelect={setExpirationDate} />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Status'/>
                            <Dropdown size='full' variant='modal' selection="Status" options={statuses} value={status} onSelect={(value) => setStatus(value)} />
                        </div>
                    </div>
                </div>

                { showModalFeedback &&
                    <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                }

                <div className='flex gap-4 mt-4 ml-auto'>
                    <Button variant='error' size='modalSize' text='Delete' onClick={() => onDelete(item.id)}/>
                    <Button variant='modalBlock' size='modalSize' text='Save' onClick={handleConfirm}/>
                </div>
            </div>
        </div>
    )
}

export default EditInventoryItem;