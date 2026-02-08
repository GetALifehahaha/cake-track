import { Button } from '@/components/atoms'
import React, { useEffect, useState } from 'react'
import { ModalFeedbackCard } from '@/components/molecules';
import api from '@/api/api';

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

	// ============ FEEDBACK ============
	
	const [feedback, setFeedback] = useState({});

	const clearFeedback = () => setFeedback({});

	// ============ EMAIL ===============

	const [email, setEmail] = useState("");

	const handleEmail = (e) => {
		e.preventDefault()

		if (e.target.value.length > 50) return

		setEmail(e.target.value)
	}

	const validateEmail = () => {
		return String(email)
		.toLowerCase()
		.match(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
	}

	const submitEmail = async () => {
		if (!validateEmail()) {
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
				console.log(res.data)
				setFeedback({
					type: res.data.type,
					label: res.data.label,
					details: res.data.details
				})
			}

		} catch (err) {
			console.log(err)
			setFeedback({
				type: err.data.type,
				label: err.data.label,
				details: err.data.details
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
	
	const sendOtp = () => {
		setOtpMessage("OTP has been sent! Check your email for the sent OTP.")
		
		// get an otp from the backend
	}

	const targetOtp = 123456;
	const [otp, setOtp] = useState('');

	const handleOtp = (e) => {
		e.preventDefault()

		if (e.target.value.length > 6) {
			return
		}

		setOtp(e.target.value)
	}

	const verifyOtp = () => {
		if (otp < 6) {
			setFeedback({
				type: 'error',
				label: 'Missing or Incomplete OTP',
				details: 'Invalid OTP code. Make sure that you have entered the 6-digit OTP from your email.'
			})

			return;
		}
		if (targetOtp === Number.parseInt(otp)) {
			handlePage('add')
			clearFeedback();	
		} else {
			setFeedback({
				type: 'error',
				label: 'Invalid OTP',
				details: 'The OTP does not match what is in our system. Please check if it is valid.'
			})
		}
	}

	const [newPassword, setNewPassword] = useState("")

  	return (
		<div className='bg-main w-full h-screen flex justify-center items-center'>
			<div className='rounded-md p-8 bg-main-white flex flex-col gap-2 shadow-md min-w-[40vw]'>
				<h5 className='text-lg text-center font-bold text-accent-dark'>Forgot Password</h5>
				<h5 className='text-md font-semibold text-accent-mute mb-8'>Follow the following instructions to gain access to your account</h5>

				{page === 1 &&
					<>
						<h5 className='text-sm text-accent-text font-medium'>Enter your email address</h5>
						<div className='flex gap-2 items-center justify-between'>
							<input type='text' value={email} onChange={(e) => handleEmail(e)} className='bg-accent-mute/20 p-1 rounded-md font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute flex-1' 
								placeholder='Enter your email address'/>
							<Button variant='modalBlock' text={otpMessage ? 'Resend OTP' : 'Send OTP'} size='small' onClick={submitEmail} />
						</div>
						{otpMessage &&
							<>
								<h5 className='text-sm text-accent-text font-medium'>Enter your OTP from your Email</h5>
								<div className='flex gap-2 items-center justify-between'>
									<input type='number' value={otp} onChange={(e) => handleOtp(e)} className='bg-accent-mute/20 p-1 rounded-md font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute flex-1' 
										placeholder='Enter OTP'/>
								</div>
								<Button className='mx-auto mt-2' text='Verify OTP' onClick={verifyOtp} />
							</>
						}
						{Object.keys(feedback).length > 0 &&
							<ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
						}
					</>
				}
				{page === 2 &&
					<>
						<input type='text' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='bg-accent-mute/20 p-1 rounded-md font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute flex-1' placeholder='ENTER NEW PASSWORD'/>

						{Object.keys(feedback).length > 0 &&
							<ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
						}
						
						<Button className='mx-auto mt-2' text='Verify OTP' onClick={verifyOtp} />
					</>
				}
			</div>
		</div>	
  	)
}

export default ForgotPassword