import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Eye, EyeClosed } from 'lucide-react';
import { Button } from '@/components/atoms';
import { ConfirmationModal } from '@/components/organisms';
import { ModalFeedbackCard } from '@/components/molecules';
import useCashier from '@/hooks/useCashier';

const SetAccount = () => {
    const [searchParams] = useSearchParams();

    const [newpassword, setNewpassword] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { activateAccount } = useCashier();

    const token = searchParams.get("token");
    const hasValidParams = token;

    const confirmPassword = () => {
        if (!newpassword) {
            setFeedback({
                label: "No password entered",
                details: "The password field is empty.",
                type: "error"
            });
            setIsConfirmModalOpen(false);
            return;
        }
        if (newpassword.length < 8) {
            setFeedback({
                label: "Password is too short",
                details: "Please enter at least 8 alphanumeric characters",
                type: "error"
            })
            return;
        }
        setIsConfirmModalOpen(true);
    }

    const closeConfirmModal = () => setIsConfirmModalOpen(false);

    const changePassword = async () => {
        setLoading(true)
        try {
            const response = await activateAccount({
                token: token,
                password: newpassword
            });

            if (response) {
                setFeedback({
                    label: response.label,
                    details: response.details,
                    type: response.type
                })
            }

            setSuccess(true);

        } catch (e) {
            setFeedback({
                label: e?.response?.data?.label || 'Activation failed',
                details: e?.response?.data?.details || 'Please try again with a valid activation link.',
                type: e?.response?.data?.type || 'error'
            });
        } finally {
            setLoading(false);
        }
        setIsConfirmModalOpen(false);
    }

    return (
        <div className='w-full min-h-screen flex items-center justify-center bg-main px-4 py-6 sm:px-6'>
            {
                hasValidParams ? (
                    <div className='w-full max-w-2xl rounded-md p-5 sm:p-8 bg-main-white flex flex-col gap-2 shadow-md'>
                        <h5 className='text-xl sm:text-2xl font-bold text-accent-dark mb-6 sm:mb-8 text-center'>Welcome to CakeTrack!</h5>
                        <h5 className='text-sm sm:text-md font-semibold text-accent-mute'>Set your password</h5>

                        <div className='flex items-center justify-center gap-2 mb-5 sm:mb-6'>
                            {!showPassword ?
                                <>
                                    <input
                                        type="password"
                                        placeholder='Enter your new password'
                                        value={newpassword}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            setNewpassword(e.target.value);
                                            setFeedback(null);
                                        }}
                                        className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full min-w-0'
                                    />
                                    <EyeClosed className='shrink-0 cursor-pointer' onClick={() => setShowPassword(true)} />
                                </>
                                :
                                <>
                                    <input
                                        type="text"
                                        placeholder='Enter your new password'
                                        value={newpassword}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            setNewpassword(e.target.value);
                                            setFeedback(null);
                                        }}
                                        className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full min-w-0'
                                    />
                                    <Eye className='shrink-0 cursor-pointer' onClick={() => setShowPassword(false)} />
                                </>
                            }
                        </div>

                        {feedback &&
                            <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type} />
                        }

                        {isConfirmModalOpen &&
                            <ConfirmationModal
                                title="Change Password"
                                content="Are you sure about your password? Be sure to remember it."
                                confirmText="Yes. I'm sure"
                                cancelText='Wait, go back.'
                                onConfirm={changePassword}
                                onReject={closeConfirmModal}
                            />
                        }

                        {loading ? <h5 className='text-accent text-center mt-2 text-sm sm:text-base'>Activating your account. Please wait...</h5> :
                            success ? <Link to={'/login'} className='mx-auto mt-2 p-2.5 px-4 bg-accent font-semibold text-white text-sm sm:text-md rounded-lg w-full sm:w-auto text-center'>Enter CakeTrack</Link> : <Button variant='active' className='mx-auto mt-2 w-full sm:w-auto' text='Set Password' onClick={confirmPassword} />
                        }
                    </div>
                ) : (
                    <div className='w-full max-w-lg rounded-md p-6 sm:p-8 bg-main-white shadow-md flex flex-col items-center justify-center gap-2 text-center'>
                        <Search size={48} className='text-accent animate-bounce' />
                        <h5 className='text-lg sm:text-xl text-red-500 font-semibold'>Invalid Link</h5>
                        <p>You do not have the correct credentials or the link is broken.</p>
                    </div>
                )
            }
        </div >
    )
}

export default SetAccount;