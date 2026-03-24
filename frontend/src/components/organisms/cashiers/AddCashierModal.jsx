import React, { useEffect, useState } from 'react';
import { Label, Button } from '../../atoms';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import ConfirmationModal from '../ConfirmationModal';
import { limitedInput } from '@/utils/safeInput';
import { isValidEmail } from '@/utils/validators';

const AddCashierModal = ({onConfirm, onClose}) => {

    const tempPasswordLength = 8;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Removed alongside the first form
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    // const [showPassword, setShowPassword] = useState(false);

    // New parameters
    const [emailAddress, setEmailAddress] = useState('');
    const [tempPassword, setTempPassword] = useState('Create a random temporary password');
    
    const [feedback, setFeedback] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (firstName.length > 1 && lastName.length > 1) setUsername(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`)
    }, [firstName, lastName])

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

    const validateForm = () => {
        if (!emailAddress || !tempPassword || !username || !firstName || !lastName || tempPassword === "Create a random temporary password") {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })

            return false;
        }

        if (!isValidEmail(emailAddress)) {
            setFeedback({
                label: 'Invalid email address',
                details: "Please enter a valid email address",
                type: 'error'
            })

            return false;
        }

        return true;
    }

    const generatePassword = () => {
        let retVal = "";

        for (var i = 0, n = charset.length; i < tempPasswordLength; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }

        setTempPassword(retVal)
    }

    const openConfirmationModal = () => {

        if (validateForm()) setIsConfirmModalOpen(true);
    }

    const handleAddCashier = () => {
        onConfirm({first_name: firstName, middle_name: middleName, last_name: lastName, username: username, email: emailAddress, password: tempPassword});
    }


    return (
        <ModalBody title='Add Cashier' onClose={onClose} className="w-[45vw]">
            <div className='flex gap-8 w-full'>
                <div className='flex flex-row gap-4 flex-1'>
                    <div className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='First Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={firstName} placeholder='e.g., Adrian' onChange={(e) => handleFirstName(e)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Middle Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={middleName} placeholder='e.g., Agraviador' onChange={(e) => handleMiddleName(e)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Last Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={lastName} placeholder='e.g., Agraviador' onChange={(e) => handleLastName(e)}/>
                        </div>
                    </div>
                    <div className='flex flex-col gap-4 flex-1'>
                        <div className='flex flex-col gap-2'>
                            <Label text='Username' variant='modal' />
                            <input value={username} onChange={(e) => handleUserName(e)} className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' placeholder="Enter a temporary username"/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label text='Email Address' variant='modal' />
                            <input value={emailAddress} onChange={(e) => handleEmailAddress(e)} className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' placeholder="Enter the new cashier's valid email address"/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label text='Temporary Password' variant='modal' />
                            <div className='flex gap-2 items-center'>
                                <h5 className='flex-1 px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'>{tempPassword}</h5>
                                <Button text='Create Password' variant='modalBlock' size='small' onClick={generatePassword}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {feedback && 
                <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
            }

            {isConfirmModalOpen &&
                <ConfirmationModal title="Add Cashier" content="Are you sure you want to add a new cashier?" onConfirm={handleAddCashier} onReject={() => setIsConfirmModalOpen(false)}/>
            }

            <div className='flex gap-4 ml-auto'>
                <Button variant='modalOutline' size='base' text='Cancel' onClick={() => setIsConfirmModalOpen(false)}/>
                <Button variant='modalBlock' size='base' text='Add Cashier' onClick={openConfirmationModal}/>
                {/* <ConfirmationModalWrapper title='Add cashier' content='Are you sure you want to add this cashier?' onConfirm={handleAddCashier}>
                    <h5 className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-text w-fit text-base flex gap-4 items-center justify-center cursor-pointer'>Register</h5>
                </ConfirmationModalWrapper> */}
            </div>
            
        </ModalBody>
    )
}

export default AddCashierModal;