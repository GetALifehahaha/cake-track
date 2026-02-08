import useCashier from '@/hooks/useCashier';
import React, { useState, useEffect } from 'react'
import api from '@/api/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/atoms';
import { ConfirmationModal } from '@/components/organisms';
import { ModalFeedbackCard } from '@/components/molecules';

const SetAccount = () => {
	// Later, we need to receive the username and password from the sent email, since this is a reroute. No username, no access
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	const [username, setUsername] = useState(searchParams.get('username') || "");
	const [password, setPassword] = useState(searchParams.get('password') || "");
	const [newpassword, setNewpassword] = useState("");
	const [loading, setLoading] = useState(true);
	const [loggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
	const [feedback, setFeedback] = useState(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	// we send a post request instantly with the username and password
	useEffect(() => {
		setIsLoggedIn(false);
		setLoading(true);
		setToken(null);
		const login = async () => {

			try {
				const response = await api.post('/users/token/', {username, password});

				if (response.status == 200) {
					setIsLoggedIn(true);
					localStorage.removeItem('refresh', response.data.refresh)
					localStorage.setItem('access', response.data.access)
				}
			} catch (err) {
				setIsLoggedIn(false);
				setToken(null);
			} finally {
				setLoading(false);
			}
		}

		setTimeout(() => {
			login();
		}, (2000))
	}, [])

	if (loading) return <div className='w-full h-screen flex flex-col items-center justify-center gap-4'>
		<Search size={48} className='text-accent animate-bounce' />	
		<h5 className='text-xl font-semibold text-accent-dark'>Checking Credentials...</h5>
		<h5 className='-mt-4 text-md font-medium text-accent-mute'>Please wait for a bit</h5>
	</div>

	const confirmPassword = () => {
		if (!newpassword) {
			setFeedback({
				label: "No password entered",
				details: "The password field is empty.",
				type: "error"
			})

			setIsConfirmModalOpen(false);
			return;
		}

		setIsConfirmModalOpen(true);
	}

	const closeConfirmModal = () => setIsConfirmModalOpen(false);

	const changePassword = async () => {
		try {
			const response = await api.post('/users/change-password/', {password: newpassword})

			if (response.status === 200) {
				navigate('/login')
			}
		} catch (e) {
			console.error(e)
		}
	}


	return (
		<div className='w-full h-screen flex items-center justify-center bg-main'>
			{
				loggedIn ?
				<div className='rounded-md p-8 bg-main-white flex flex-col gap-2 shadow-md'>
					<h5 className='text-2xl font-bold text-accent-dark mb-8'>Welcome to CakeTrack!</h5>
					<h5 className='text-md font-semibold text-accent-mute'>Change your temporary password</h5>
					<input placeholder='Enter your new password' value={newpassword} onChange={(e) => {e.preventDefault(); setNewpassword(e.target.value)}} className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full mb-6'/>

					{feedback && 
						<ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
					}

					{isConfirmModalOpen &&
						<ConfirmationModal title="Change Password" content="Are you about your password? Be sure to remember it." confirmText="Yes. I'm sure" cancelText='Wait, go back.' onConfirm={changePassword} onReject={closeConfirmModal}/>
					}

					<Button className='mx-auto mt-2' text='Change Password' onClick={confirmPassword} />
				</div> :
				<h5>You do not have the correct credentials to continue with this action.</h5>
			}
		</div>
	)
}

export default SetAccount