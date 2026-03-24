import React, { useState } from 'react';
import { Label } from '../../atoms';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import ConfirmationModalWrapper from '../ConfirmationModalWrapper';
import { limitedInput } from '@/utils/safeInput';
import { isValidEmail } from '@/utils/validators';

const EditCashierModal = ({cashier, onDeactivate, onConfirm, onClose}) => {

    const [firstName, setFirstName] = useState(cashier.first_name || '');
    const [lastName, setLastName] = useState(cashier.last_name || '');
    const [middleName, setMiddleName] = useState(cashier.middle_name || '');
    const [emailAddress, setEmailAddress] = useState(cashier.email || '');
    const [username, setUsername] = useState(cashier.username || '');
    
    const [feedback, setFeedback] = useState("");

    const handleFirstName = (e) => {
        const value = limitedInput(e, { maxLength: 50 });
        if (value === undefined) return;
        setFirstName(value)
    }

    const handleMiddleName = (e) => {
        const value = limitedInput(e, { maxLength: 50 });
        if (value === undefined) return;
        setMiddleName(value)
    }

    const handleLastName = (e) => {
        const value = limitedInput(e, { maxLength: 50 });
        if (value === undefined) return;
        setLastName(value)
    }

    const handleUserName = (e) => {
        const value = limitedInput(e, { maxLength: 50 });
        if (value === undefined) return;
        setUsername(value)
    }

    const handleEmailAddress = (e) => {
        const value = limitedInput(e, { maxLength: 50 });
        if (value === undefined) return;
        setEmailAddress(value)
    }

    const editCashier = () => {
        if (!firstName || !lastName ||!middleName ||!username || !emailAddress) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return;
        }

        if (!isValidEmail(emailAddress)) {
            setFeedback({
                label: 'Invalid email address',
                details: "Please enter a valid email address",
                type: 'error'
            })

            return false;
        }

        let payload = {}
        firstName !== cashier.first_name && (payload.first_name = firstName);
        lastName !== cashier.last_name && (payload.last_name = lastName);
        middleName !== cashier.middle_name && (payload.middle_name = middleName);
        username !== cashier.username && (payload.username = username);
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
        <ModalBody title='Edit Cashier Details' onClose={onClose}>
            <div className='flex gap-8'>
                <div className='flex flex-col gap-4 w-120'>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='First Name' />
                        <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={firstName} placeholder='e.g., Adrian' onChange={(e) => handleFirstName(e)}/>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Middle Name' />
                        <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={middleName} placeholder='e.g., Adrian Agraviador' onChange={(e) => handleMiddleName(e)}/>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Last Name' />
                        <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={lastName} placeholder='e.g., Agraviador' onChange={(e) => handleLastName(e)}/>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='User Name' />
                        <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={username} placeholder='e.g., adrian_agraviador' onChange={(e) => handleUserName(e)}/>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Email Address' />
                        <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={emailAddress} placeholder='e.g., agraviador@gmail.com' onChange={(e) => handleEmailAddress(e)}/>
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
        </ModalBody>
    )
}

export default EditCashierModal;