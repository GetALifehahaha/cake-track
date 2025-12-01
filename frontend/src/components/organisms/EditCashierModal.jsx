import React, { useState } from 'react';
import { Title, Label, Button } from '../atoms';
import { ModalFeedbackCard } from '../molecules';
import { X, EyeClosed, Eye } from 'lucide-react';
import ConfirmationModalWrapper from './ConfirmationModalWrapper';

const EditCashierModal = ({cashier, onDeactivate, onConfirm, onClose}) => {

    const [firstName, setFirstName] = useState(cashier.first_name || '');
    const [lastName, setLastName] = useState(cashier.last_name || '');
    const [emailAddress, setEmailAddress] = useState(cashier.email || '');
    const [username, setUsername] = useState(cashier.username || '');
    // const [password, setPassword] = useState(cashier.password);
    
    const [feedback, setFeedback] = useState("");

    const editCashier = () => {
        if (!firstName || !lastName  || !emailAddress) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return;
        }

        let payload = {}
        firstName !== cashier.first_name && (payload.first_name = firstName);
        lastName !== cashier.last_name && (payload.last_name = lastName);
        emailAddress !== cashier.email && (payload.email = emailAddress);

        onConfirm(payload);
    }

    const deactivateCashier = () => {
        onConfirm({is_active: false});
    }

    const activateCashier = () => {
        onConfirm({is_active: true});
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
                            <Label variant='modal' text='First Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={firstName} placeholder='e.g., Adrian Agraviador' onChange={(e) => setFirstName(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Last Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={lastName} placeholder='e.g., Adrian Agraviador' onChange={(e) => setLastName(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Last Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={username} placeholder='e.g., Adrian Agraviador' onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        {/* <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Contact Number' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={contactNumber} placeholder='09876543210' onChange={(e) => setContactNumber(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Address' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={address} placeholder='e.g., Boalan, Z.C.' onChange={(e) => setAddress(e.target.value)}/>
                        </div> */}
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Email Address' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={emailAddress} placeholder='e.g., agraviador@gmail.com' onChange={(e) => setEmailAddress(e.target.value)}/>
                        </div>
                    </div>
                </div>

                {feedback && 
                    <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
                }
                <div className='flex gap-4 ml-auto'>
                    {cashier.is_active ? 
                    <ConfirmationModalWrapper title='Deactivate cashier?' content='You can activate an account back again.' onConfirm={deactivateCashier}>
                        <h5 className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-error w-fit text-base cursor-pointer'>Deactivate Cashier</h5>
                    </ConfirmationModalWrapper>
                    :
                    <ConfirmationModalWrapper title='Activate cashier?' content='This will allow the cashier to use the resources again.' onConfirm={activateCashier}>
                        <h5 className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-success w-fit text-base cursor-pointer'>Activate</h5>
                    </ConfirmationModalWrapper>
                    }
                    <ConfirmationModalWrapper title='Save changes?' content='Are you finished with the changes?' onConfirm={editCashier}>
                        <h5 className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-text w-fit text-base cursor-pointer'>Save</h5>
                    </ConfirmationModalWrapper>
                </div>
            </div>
        </div>
    )
}

export default EditCashierModal;