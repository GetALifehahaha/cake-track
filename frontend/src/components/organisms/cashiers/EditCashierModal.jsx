import React, { useState } from 'react';
import { Title, Label, Button } from '../../atoms';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import { X, EyeClosed, Eye } from 'lucide-react';
import ConfirmationModalWrapper from '../ConfirmationModalWrapper';

const EditCashierModal = ({cashier, onDeactivate, onConfirm, onClose}) => {

    const [firstName, setFirstName] = useState(cashier.first_name || '');
    const [lastName, setLastName] = useState(cashier.last_name || '');
    const [middleName, setMiddleName] = useState(cashier.middle_name || '');
    const [emailAddress, setEmailAddress] = useState(cashier.email || '');
    const [username, setUsername] = useState(cashier.username || '');
    
    const [feedback, setFeedback] = useState("");

    const handleFirstName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setFirstName(e.target.value)
    }

    const handleMiddleName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setMiddleName(e.target.value)
    }

    const handleLastName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setLastName(e.target.value)
    }

    const handleUserName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setUsername(e.target.value)
    }

    const handleEmailAddress = (e) => {
        e.preventDefault();

        if (e.target.value.length > 50) return

        setEmailAddress(e.target.value)
    }

    const validateEmail = () => {
		return String(emailAddress)
		.toLowerCase()
		.match(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
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

        if (!validateEmail()) {
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
        middleName !== cashier.middle_name && (payload.middleName = middleName);
        username !== cashier.username && (payload = username);
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