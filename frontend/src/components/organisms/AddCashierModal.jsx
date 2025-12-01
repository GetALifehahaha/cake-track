import React, { useState } from 'react';
import { Title, Label, Button } from '../atoms';
import { ModalFeedbackCard } from '../molecules';
import { X, EyeClosed, Eye } from 'lucide-react';
import ConfirmationModalWrapper from './ConfirmationModalWrapper';

const AddCashierModal = ({onConfirm, onClose}) => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    
    const [feedback, setFeedback] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleAddCashier = () => {
        if (!firstName || !lastName  || !username || !password) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return;
        }
        // if (password !== confirmPassword) {
        //     setFeedback({
        //         label: 'Password Mismatch',
        //         details: "The password and confirm password fields do not match",
        //         type: 'error'
        //     })
        //     return;
        // }

        onConfirm({first_name: firstName, last_name: lastName, username, email: emailAddress, password});
    }


    return (
        <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className="flex justify-between items-center w-full">
                    <Title variant='modal' text='Add Cashier' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                </div>

                <div className='flex gap-8'>
                    <div className='flex flex-col gap-8 w-120'>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='First Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={firstName} placeholder='e.g., Adrian' onChange={(e) => setFirstName(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Last Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={lastName} placeholder='e.g., Agraviador' onChange={(e) => setLastName(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Username' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={username} placeholder='e.g., adrianagraviador' onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Email Address' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={emailAddress} placeholder='e.g., agraviador@gmail.com' onChange={(e) => setEmailAddress(e.target.value)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Password' />
                            <span className='px-4 py-2 rounded-sm bg-main-dark/50 flex flex-row gap-2 items-center'>
                                {showPassword ?
                                    <>
                                        <input type='text' className=' focus:outline-none w-full' placeholder="Enter the cashier's password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                        <EyeClosed className='text-text/50 cursor-pointer' onClick={() => setShowPassword(false)} />
                                    </> :
                                    <>
                                        <input type='password' className=' focus:outline-none w-full' placeholder="Enter the cashier's password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                        <Eye className='text-text/50 cursor-pointer' onClick={() => setShowPassword(true)} />
                                    </>
                                }
                            </span>
                        </div>
                    </div>
                </div>

                {feedback && 
                    <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
                }
                <div className='flex gap-4 ml-auto'>
                    <Button variant='modalOutline' size='base' text='Cancel' onClick={onClose}/>
                    <ConfirmationModalWrapper title='Add cashier' content='Are you sure you want to add this cashier?' onConfirm={handleAddCashier}>
                        <h5 className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-text w-fit text-base flex gap-4 items-center justify-center cursor-pointer'>Register</h5>
                    </ConfirmationModalWrapper>
                    {/* <Button variant='modalBlock' size='base' text='Add Item' onClick={handleAddCashier}/> */}
                </div>
            </div>
        </div>
    )
}

export default AddCashierModal;