import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
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

            console.log(response)

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
        <div className='w-full h-screen flex items-center justify-center bg-main'>
            {
                hasValidParams ? (
                    <div className='rounded-md p-8 bg-main-white flex flex-col gap-2 shadow-md'>
                        <h5 className='text-2xl font-bold text-accent-dark mb-8'>Welcome to CakeTrack!</h5>
                        <h5 className='text-md font-semibold text-accent-mute'>Set your password</h5>

                        <div className='flex items-center justify-center gap-2 mb-6'>
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
                                        className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                                    />
                                    <EyeClosed onClick={() => setShowPassword(true)} />
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
                                        className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                                    />
                                    <Eye onClick={() => setShowPassword(false)} />
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

                        {loading ? <h5 className='text-accent'>Activating your account. Please wait...</h5> :
                            !success && <Button className='mx-auto mt-2' text='Set Password' onClick={confirmPassword} />
                        }
                    </div>
                ) : (
                    <div className='rounded-md p-8 bg-main-white shadow-md flex flex-col items-center justify-center gap-2'>
                        <Search size={48} className='text-accent animate-bounce' />
                        <h5 className='text-xl text-red-500 font-semibold'>Invalid Link</h5>
                        <p>You do not have the correct credentials or the link is broken.</p>
                    </div>
                )
            }
        </div>
    )
}

export default SetAccount;