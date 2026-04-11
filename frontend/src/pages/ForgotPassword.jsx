import { Button } from '@/components/atoms'
import React, { useState } from 'react'
import { ModalFeedbackCard } from '@/components/molecules';
import { ConfirmationModal } from '@/components/organisms';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '@/utils/validators';
import { limitedInput } from '@/utils/safeInput';

const ForgotPassword = () => {

	// generate OTP -> model, OTP (id, time_out, valid, content)
	// input OTP
		// check timeout
		// check validity
	// regenerate OTP
		// invalidate validity
	// input password
	// change password
	// validate

	const navigate = useNavigate();

	// ============ FEEDBACK ============
	
	const [feedback, setFeedback] = useState({});

	const clearFeedback = () => setFeedback({});

	// ============ EMAIL ===============

	const [email, setEmail] = useState("");

	const handleEmail = (e) => {
		const value = limitedInput(e, { maxLength: 50 });
		if (value === undefined) return;
		setEmail(value)
	}

	const submitEmail = async () => {
		if (!isValidEmail(email)) {
			setFeedback({
				type: "error",
				label: "Invalid Email Address",
				details: "Please enter a valid email address."
			});

			return;
		}
		clearFeedback();
		setOtpMessage("Your OTP has been sent to your Gmail.")

		try {
			const res = await api.post('/request-otp/', {email: email})

			if (res.status === 200) {
				setFeedback({
					type: res.data.type,
					label: res.data.label,
					details: res.data.details
				})
			}

		} catch (err) {
			setFeedback({
				type: err?.response?.data?.type || 'error',
				label: err?.response?.data?.label || 'Failed to send OTP',
				details: err?.response?.data?.details || 'Please try again.'
			})
		}
	}
	
	// ============ PAGING ==============

	const [page, setPage] = useState(1);

	const handlePage = (direction) => {
		setFeedback({});

		setPage(prev => {
			if (direction === 'add') return prev + 1
			if (direction === 'sub') return Math.max(1, prev - 1)
			return prev
		})
	}

	// useEffect(() => {
	// 	console.log(page)
	// }, [page])

	// ======= OTP =============
	
	const [otpMessage, setOtpMessage] = useState(null);
	
	const [otp, setOtp] = useState('');
	const [token, setToken] = useState('');

	const handleOtp = (e) => {
		const value = limitedInput(e, { maxLength: 6, digitsOnly: true });
		if (value === undefined) return;
		setOtp(value)
	}

	const verifyOtp = async () => {
		if (String(otp).length < 6) {
			setFeedback({
				type: 'error',
				label: 'Missing or Incomplete OTP',
				details: 'Invalid OTP code. Make sure that you have entered the 6-digit OTP from your email.'
			})

			return;
		}

		try {

			const res = await api.post('/verify-otp/', {email: email, otp: otp});

			if (res.status === 200) {
				setFeedback({
					type: res.data.type,
					label: res.data.label,
					details: res.data.details
				})
				setToken(res.data.token);
			}

			handlePage('add');
		} catch (err) {
			setFeedback({
				type: err?.response?.data?.type || 'error',
				label: err?.response?.data?.label || 'OTP verification failed',
				details: err?.response?.data?.details || 'Please check your OTP and try again.'
			})
		}
	}

	// ============= SETTING NEW PASSWORD ==============

	const [newPassword, setNewPassword] = useState("")
	const [confirmModal, setConfirmModal] = useState(false);

	const handleNewPassword = (e) => {
		e.preventDefault(e)

		setNewPassword(e.target.value)
	}

	const handleConfirmModal = (value) => {
		setConfirmModal(value)

		
	}

	const confirmNewPassword = async () => {
		handleConfirmModal(false);
		if (newPassword.length < 8) {
			setFeedback({
				type: "error",
				label: "Password too short",
				details: "Please set your password to have at least 8 letters or numbers"
			})

			return;
		}

		try {
			const res = await api.post('/change-password-token/', {email: email, token: token, password: newPassword});
			if (res.status === 200) {
				setFeedback({
					type: "success",
					label: "Password Changed Successfully",
					details: "Your password has been changed successfully. Will be redirected to the login page in a few seconds."
				})
			}

			setTimeout(() => {
				navigate('/login')
			}, 3000)
		} catch (err) {
			setFeedback({
				type: err?.response?.data?.type || 'error',
				label: err?.response?.data?.label || 'Password change failed',
				details: err?.response?.data?.details || 'Please request a new OTP and try again.'
			})
		}
	}
  	return (
		<div className='bg-main w-full min-h-screen flex justify-center items-center px-4 py-6 sm:px-6'>
			<div className='w-full max-w-2xl rounded-md p-5 sm:p-8 bg-main-white flex flex-col gap-2 shadow-md'>
				<h5 className='text-lg sm:text-xl text-center font-bold text-accent-dark'>Forgot Password</h5>
				<h5 className='text-sm sm:text-md font-semibold text-accent-mute mb-6 sm:mb-8'>Follow the following instructions to gain access to your account</h5>

				{page === 1 &&
					<>
						<h5 className='text-sm text-accent-text font-medium'>Enter your email address</h5>
						<div className='flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between'>
							<input type='text' value={email} onChange={(e) => handleEmail(e)} className='bg-accent-mute/20 p-1 rounded-md font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute flex-1' 
								placeholder='Enter your email address'/>
							<Button className='w-full sm:w-auto' variant='modalBlock' text={otpMessage ? 'Resend OTP' : 'Send OTP'} size='small' onClick={submitEmail} />
						</div>
						{otpMessage &&
							<>
								<h5 className='text-sm text-accent-text font-medium'>Enter your OTP from your Email</h5>
								<div className='flex gap-2 items-center justify-between'>
									<input type='text' inputMode='numeric' value={otp} onChange={(e) => handleOtp(e)} className='bg-accent-mute/20 p-1 rounded-md font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute flex-1' 
										placeholder='Enter OTP'/>
								</div>
								<Button className='mx-auto mt-2 w-full sm:w-auto' text='Verify OTP' onClick={verifyOtp} />
							</>
						}
						{Object.keys(feedback).length > 0 &&
							<ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
						}
					</>
				}
				{page === 2 &&
					<>
						<input type='text' value={newPassword} onChange={(e) => handleNewPassword(e)} className='bg-accent-mute/20 p-1 rounded-md font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute flex-1' placeholder='ENTER NEW PASSWORD'/>

						{Object.keys(feedback).length > 0 &&
							<ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
						}
						<Button className='mx-auto mt-2 w-full sm:w-auto' text='Change Password' onClick={handleConfirmModal} />
					</>
				}
			</div>
			
			{confirmModal &&
				<ConfirmationModal title="Change Password" content="Are you about your password? Be sure to remember it." confirmText="Yes. I'm sure" cancelText='Wait, go back.' onConfirm={confirmNewPassword} onReject={() => handleConfirmModal(false)}/>
			}
		</div>	
  	)
}

export default ForgotPassword