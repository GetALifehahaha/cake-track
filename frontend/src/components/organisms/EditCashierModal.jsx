import React, { useState } from 'react';
import { Title, Label, Button } from '../atoms';
import { ModalFeedbackCard } from '../molecules';
import { X, EyeClosed, Eye } from 'lucide-react';

const EditCashierModal = ({cashier, onDelete, onConfirm, onClose}) => {

    const [fullName, setFullName] = useState(cashier.fullName);
    const [contactNumber, setContactNumber] = useState(cashier.contactNumber);
    const [address, setAddress] = useState(cashier.address);
    const [emailAddress, setEmailAddress] = useState(cashier.emailAddress);
    const [password, setPassword] = useState(cashier.password);
    
    const [feedback, setFeedback] = useState("");

    const handleEditCashier = () => {
        if (!fullName || !contactNumber || !address || !emailAddress) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return;
        }

        onConfirm({id: cashier.id, fullName, contactNumber, address, emailAddress, password});
    }


    return (
        <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className="flex justify-between items-center w-full">
                    <Title variant='modal' text='Action' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                </div>

                <div className='flex gap-8'>
                    <div className='flex flex-col gap-8 w-120'>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Full Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={fullName} placeholder='e.g., Adrian Agraviador' onChange={(e) => setFullName(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Contact Number' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={contactNumber} placeholder='09876543210' onChange={(e) => setContactNumber(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Address' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={address} placeholder='e.g., Boalan, Z.C.' onChange={(e) => setAddress(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Email Address' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={emailAddress} placeholder='e.g., agraviador@gmail.com' onChange={(e) => setEmailAddress(e.target.value)}/>
                        </div>
                        {/* <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Password' />
                            <span className='px-4 py-2 rounded-sm bg-main-dark/50 flex flex-row gap-2 items-center'>
                                {showPassword ?
                                    <>
                                        <input type='text' className=' focus:outline-none w-full' value={password} onChange={(e) => setPassword(e.target.value)}/>
                                        <EyeClosed className='text-text/50 cursor-pointer' onClick={() => setShowPassword(false)} />
                                    </> :
                                    <>
                                        <input type='password' className=' focus:outline-none w-full' value={password} onChange={(e) => setPassword(e.target.value)}/>
                                        <Eye className='text-text/50 cursor-pointer' onClick={() => setShowPassword(true)} />
                                    </>
                                }
                            </span>
                        </div> */}
                    </div>
                </div>

                {feedback && 
                    <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
                }
                <div className='flex gap-4 ml-auto'>
                    <Button variant='error' size='base' text='Delete' onClick={() => onDelete(cashier.id)}/>
                    <Button variant='modalBlock' size='base' text='Save' onClick={handleEditCashier}/>
                </div>
            </div>
        </div>
    )
}

export default EditCashierModal;