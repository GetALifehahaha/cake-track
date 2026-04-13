import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState, useContext, useEffect } from 'react'
import { Lock, Mail, Eye, EyeClosed, User2Icon, Loader2, Phone } from 'lucide-react-native'
import { AuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import ActionConfirmModal from '@/components/organisms/ActionConfirmModal'
import {
	isValidEmail,
	hasMinCredentialLength,
	isPasswordSimilarToUsername,
	isValidPHPhoneNumber,
	formatPhoneNumber,
	normalizePhoneNumber,
	hasUppercaseCharacter,
	hasLowercaseCharacter,
} from '@/utils/validators';
// 1. Import Google Sign-In
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const LoginSignup = ({ method }) => {
	const { showToast } = useToast();
	// 2. Destructure googleLogin from context
	const { login, loading: authLoading, register, reactivateAccount } = useContext(AuthContext)

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Signup specific
	const [firstName, setFirstName] = useState("");
	const [middleName, setMiddleName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [username, setUsername] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [loading, setLoading] = useState(false);
	const [reactivating, setReactivating] = useState(false);
	const [showSignupConfirmModal, setShowSignupConfirmModal] = useState(false);
	const [showReactivateModal, setShowReactivateModal] = useState(false);
	const [reactivatePromptText, setReactivatePromptText] = useState('');
	const [deactivatedUsername, setDeactivatedUsername] = useState('');

	const validateSignupCredentialRules = () => {
		if (!hasMinCredentialLength(username)) {
			showToast("Username must be at least 8 characters", "error");
			return false;
		}

		if (!hasMinCredentialLength(password)) {
			showToast("Password must be at least 8 characters", "error");
			return false;
		}

		if (!hasMinCredentialLength(confirmPassword)) {
			showToast("Confirm password must be at least 8 characters", "error");
			return false;
		}

		if (!hasLowercaseCharacter(password) || !hasUppercaseCharacter(password)) {
			showToast("Password must contain at least 1 lowercase and 1 uppercase character", "error");
			return false;
		}

		if (isPasswordSimilarToUsername(username, password)) {
			showToast("Password should not be similar to the username", "error");
			return false;
		}

		return true;
	};

	const handlePhoneNumberChange = (text) => {
		setPhoneNumber(formatPhoneNumber(text));
	};

	const validateSignupForm = () => {
		if (!firstName || !lastName || !emailAddress || !username || !password || !confirmPassword) {
			showToast("Please fill in all fields", "error");
			return false;
		}

		if (!isValidEmail(emailAddress)) {
			showToast("Please enter a valid email address", "error");
			return false;
		}

		if (phoneNumber.trim() && !isValidPHPhoneNumber(phoneNumber)) {
			showToast("Please enter a valid phone number", "error");
			return false;
		}

		if (password !== confirmPassword) {
			showToast("Passwords do not match", "error");
			return false;
		}

		return validateSignupCredentialRules();
	};

	const handleLoginSubmit = async () => {
		try {
			setLoading(true);

			if (!username || !password) {
				showToast("Please fill in all fields", "error");
				return;
			}

			const res = await login(username.trim(), password)

			if (res.success) {
				showToast("Logged in successfully!", "success");
				router.replace('/(tabs)/');
			} else if (res.deactivated) {
				setDeactivatedUsername(res.username || username);
				setReactivatePromptText('');
				setShowReactivateModal(true);
			} else if (res.error) {
				showToast(res.error, "error");
			}


		} catch (error) {
			showToast(error.message || "Login failed", "error")
		}
		finally {
			setLoading(false);
		}
	}

	const submitSignup = async () => {
		try {
			setLoading(true);

			if (!validateSignupForm()) {
				setShowSignupConfirmModal(false);
				return;
			}

			const res = await register(
				username.trim(),
				password,
				firstName.trim(),
				middleName.trim(),
				lastName.trim(),
				emailAddress.trim(),
				normalizePhoneNumber(phoneNumber),
			);

			if (res.success) {
				setShowSignupConfirmModal(false);
				showToast("Signed up successfully! Login with your credentials", "success");
				router.replace('/(auth)/login');
			}

			if (res.error) {
				showToast(res.error, "error");
			}
		} catch (error) {
			showToast(error.message || "Signup failed", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleSignupPress = () => {
		if (!validateSignupForm()) {
			return;
		}

		setShowSignupConfirmModal(true);
	};

	const handleReactivate = async () => {
		const targetUsername = deactivatedUsername || username;
		if (!targetUsername) {
			showToast('Username is required to reactivate account', 'error');
			return;
		}

		if (!password) {
			showToast('Please enter your password first', 'error');
			return;
		}

		setReactivating(true);
		try {
			const result = await reactivateAccount(targetUsername, password, reactivatePromptText.trim());
			if (result.success) {
				setShowReactivateModal(false);
				setReactivatePromptText('');
				showToast('Account reactivated successfully!', 'success');
				router.replace('/(tabs)/');
				return;
			}

			showToast(result.error || 'Failed to reactivate account', 'error');
		} finally {
			setReactivating(false);
		}
	};

	if (authLoading) return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" color="#8B5A3C" />
		</View>
	)

	const isSignup = method === 'signup';
	const usernameHasMinLength = hasMinCredentialLength(username);
	const passwordHasMinLength = hasMinCredentialLength(password);
	const passwordHasUpper = hasUppercaseCharacter(password);
	const passwordHasLower = hasLowercaseCharacter(password);
	const passwordNotSimilar = !isPasswordSimilarToUsername(username, password);
	const confirmHasMinLength = hasMinCredentialLength(confirmPassword);
	const confirmMatchesPassword = confirmPassword.length > 0 && confirmPassword === password;
	const passwordIsStrict = passwordHasMinLength && passwordHasUpper && passwordHasLower && passwordNotSimilar;

	return (
		<LinearGradient
			colors={isSignup ? ['#FFF2E6', '#FFD8C8', '#FFE7F2'] : ['#F7F2ED', '#F2ECE7', '#EEE7E2']}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			style={{ flex: 1 }}
		>
			<SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
				>
					<ScrollView
						style={{ flex: 1 }}
						contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 18, paddingBottom: 32, paddingTop: 6 }}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View className='w-full self-center max-w-[560px]'>
							<View className='w-full items-center my-5 gap-2'>
								<TouchableOpacity
									className='self-end px-4 py-2 rounded-full bg-white/85 border border-[#e8d6c7]'
									onPress={() => router.replace('/(tabs)/')}
								>
									<Text className='text-center text-[11px] font-semibold text-secondary-light'>BACK TO APP</Text>
								</TouchableOpacity>

								<Image className='w-20 h-20 rounded-full border-4 border-white/80' source={require('@/assets/images/logo.jpg')} />
								<Text className='text-2xl font-bold text-primary text-center'>Michelle's Cakes & Cafe</Text>
								<Text className='text-sm font-medium text-[#6f665f] text-center'>
									{isSignup ? 'Create your account and start customizing cakes.' : 'Welcome back. Login to continue your orders.'}
								</Text>
							</View>

							<View className='bg-white/95 border border-[#eadbcf] rounded-[34px] px-4 py-5 mb-4 shadow-sm'>
								<View className='flex-row bg-[#f5ede6] p-1.5 rounded-full mb-6'>
									<TouchableOpacity
										className={`flex-1 py-3 rounded-full ${method === 'login' ? 'bg-[#8B5A3C]' : 'bg-transparent'}`}
										onPress={() => router.replace('/(auth)/login')}
									>
										<Text className={`text-center font-semibold ${method === 'login' ? 'text-white' : 'text-[#8a7a6e]'}`}>Login</Text>
									</TouchableOpacity>

									<TouchableOpacity
										className={`flex-1 py-3 rounded-full ${method === 'signup' ? 'bg-[#8B5A3C]' : 'bg-transparent'}`}
										onPress={() => router.replace('/(auth)/signup')}
									>
										<Text className={`text-center font-semibold ${method === 'signup' ? 'text-white' : 'text-[#8a7a6e]'}`}>Sign Up</Text>
									</TouchableOpacity>
								</View>

								{method === 'login' && (
									<View className='gap-4'>
										<View>
											<Text className='text-[13px] font-semibold text-[#7A4A2A] mb-1 ml-1'>Username</Text>
											<View className='flex-row items-center rounded-full border border-[#DEC7B3] bg-white px-4'>
												<User2Icon style={{ color: '#BE9B7B' }} size={16} />
												<TextInput
													className='flex-1 py-3.5 ml-2 text-black'
													placeholder='Enter your username'
													placeholderTextColor='#9ca3af'
													autoCapitalize='none'
													value={username}
													onChangeText={setUsername}
												/>
											</View>
										</View>

										<View>
											<Text className='text-[13px] font-semibold text-[#7A4A2A] mb-1 ml-1'>Password</Text>
											<View className='flex-row items-center rounded-full border border-[#DEC7B3] bg-white px-4'>
												<Lock style={{ color: '#BE9B7B' }} size={16} />
												<TextInput
													className='flex-1 py-3.5 ml-2 text-black'
													placeholder='Enter password'
													placeholderTextColor='#9ca3af'
													secureTextEntry={!showPassword}
													value={password}
													onChangeText={setPassword}
												/>
												<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
													{showPassword ? <Eye style={{ color: 'gray' }} size={18} /> : <EyeClosed style={{ color: 'gray' }} size={18} />}
												</TouchableOpacity>
											</View>
										</View>

										{loading ? (
											<View className='p-4 rounded-full bg-secondary-strong flex-row justify-center items-center opacity-60'>
												<Loader2 size={16} color='#fff' className='animate-spin' />
												<Text className='text-center font-semibold text-white ml-2'>Processing...</Text>
											</View>
										) : (
											<TouchableOpacity className='p-4 rounded-full bg-secondary-strong mt-8' onPress={handleLoginSubmit}>
												<Text className='text-center font-semibold text-white'>LOGIN</Text>
											</TouchableOpacity>
										)}

										<TouchableOpacity className='mt-1' onPress={() => router.push('/(auth)/forgotPassword')}>
											<Text className='text-center text-secondary-light font-medium'>Forgot Password?</Text>
										</TouchableOpacity>
									</View>
								)}

								{method === 'signup' && (
									<View className='gap-5'>
										<Text className='text-center text-black font-semibold text-base mb-1'>Create an account to start ordering!</Text>

										<Text className='text-[13px] font-semibold text-[#7A4A2A] ml-1 -mb-2'>First Name</Text>
										<TextInput className='px-4 py-3.5 border border-[#DEC7B3] rounded-full text-black bg-white' placeholder='Enter your first name' placeholderTextColor='#9ca3af' value={firstName} onChangeText={setFirstName} />

										<Text className='text-[13px] font-semibold text-[#7A4A2A] ml-1 -mb-2'>Middle Name (Optional)</Text>
										<TextInput className='px-4 py-3.5 border border-[#DEC7B3] rounded-full text-black bg-white' placeholder='Enter your middle name' placeholderTextColor='#9ca3af' value={middleName} onChangeText={setMiddleName} />

										<Text className='text-[13px] font-semibold text-[#7A4A2A] ml-1 -mb-2'>Last Name</Text>
										<TextInput className='px-4 py-3.5 border border-[#DEC7B3] rounded-full text-black bg-white' placeholder='Enter your last name' placeholderTextColor='#9ca3af' value={lastName} onChangeText={setLastName} />

										<Text className='text-[13px] font-semibold text-[#7A4A2A] -mb-2 ml-1'>Phone Number (Optional)</Text>
										<TextInput
											className='px-4 py-3.5 border border-[#DEC7B3] rounded-full text-black bg-white'
											placeholder='0912 345 6789'
											placeholderTextColor='#9ca3af'
											value={phoneNumber}
											onChangeText={handlePhoneNumberChange}
											keyboardType='number-pad'
											maxLength={13}
										/>

										<Text className='text-[13px] font-semibold text-[#7A4A2A] -mb-2 ml-1'>Email Address</Text>
										<TextInput className='px-4 py-3.5 border border-[#DEC7B3] rounded-full text-black bg-white' placeholder='Enter your email address' placeholderTextColor='#9ca3af' value={emailAddress} onChangeText={setEmailAddress} autoCapitalize='none' />

										<Text className='text-[13px] font-semibold text-[#7A4A2A] -mb-2 ml-1'>Username</Text>
										<TextInput className='px-4 py-3.5 border border-[#DEC7B3] rounded-full text-black bg-white' placeholder='Enter your username' placeholderTextColor='#9ca3af' value={username} onChangeText={setUsername} autoCapitalize='none' />
										<Text className={`text-[10px] ml-2 -mt-4 ${username.length === 0 ? 'text-[#8d7a6c]' : usernameHasMinLength ? 'text-green-700' : 'text-red-500'}`}>
											Username at least 8 characters.
										</Text>

										<Text className='text-[13px] font-semibold text-[#7A4A2A] -mb-2 ml-1 mt-1'>Password</Text>
										<View className='flex-row items-center rounded-full border border-[#DEC7B3] bg-white px-4'>
											<Lock style={{ color: '#BE9B7B' }} size={16} />
											<TextInput
												className='flex-1 py-3.5 ml-2 text-black'
												placeholder='Enter password'
												placeholderTextColor='#9ca3af'
												secureTextEntry={!showPassword}
												value={password}
												onChangeText={setPassword}
											/>
											<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
												{showPassword ? <Eye style={{ color: 'gray' }} size={18} /> : <EyeClosed style={{ color: 'gray' }} size={18} />}
											</TouchableOpacity>
										</View>
										<Text className={`text-[10px] ml-2 -mt-4 ${password.length === 0 ? 'text-[#8d7a6c]' : passwordIsStrict ? 'text-green-700' : 'text-red-500'}`}>
											Password should have at least 8 characters, 1 lowercase, 1 uppercase.
										</Text>

										<Text className='text-[13px] font-semibold text-[#7A4A2A] -mb-2 ml-1 mt-1'>Confirm Password</Text>
										<View className='flex-row items-center rounded-full border border-[#DEC7B3] bg-white px-4'>
											<Lock style={{ color: '#BE9B7B' }} size={16} />
											<TextInput
												className='flex-1 py-3.5 ml-2 text-black'
												placeholder='Re-enter your password'
												placeholderTextColor='#9ca3af'
												secureTextEntry={!showConfirmPassword}
												value={confirmPassword}
												onChangeText={setConfirmPassword}
											/>
											<TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
												{showConfirmPassword ? <Eye style={{ color: 'gray' }} size={18} /> : <EyeClosed style={{ color: 'gray' }} size={18} />}
											</TouchableOpacity>
										</View>
										<Text className={`text-[10px] ml-2 -mt-4 ${confirmPassword.length === 0 ? 'text-[#8d7a6c]' : (confirmHasMinLength && confirmMatchesPassword) ? 'text-green-700' : 'text-red-500'}`}>
											Confirm password should match password
										</Text>

										{loading ? (
											<View className='mt-1 p-4 rounded-full bg-secondary-strong flex-row justify-center items-center opacity-60'>
												<Loader2 size={16} color='#fff' className='animate-spin' />
												<Text className='text-center font-semibold text-white ml-2'>Processing...</Text>
											</View>
										) : (
											<TouchableOpacity className='mt-1 p-4 rounded-full bg-secondary-strong' onPress={handleSignupPress}>
												<Text className='text-center font-semibold text-white'>SIGN UP</Text>
											</TouchableOpacity>
										)}
									</View>
								)}
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>

				<Modal
					visible={showReactivateModal}
					transparent
					animationType="fade"
					onRequestClose={() => setShowReactivateModal(false)}
				>
					<View className='flex-1 bg-black/50 items-center justify-center px-6'>
						<View className='w-full max-w-[420px] rounded-2xl bg-white p-5 border border-gray-200'>
							<Text className='text-lg font-bold text-primary'>Account Inactive</Text>
							<Text className='mt-2 text-gray-700'>
								This account is no longer active. Do you want to activate it again?
							</Text>
							<Text className='mt-3 text-xs text-gray-600'>
								Type activate {deactivatedUsername || username} to continue.
							</Text>

							<TextInput
								className='mt-2 px-3 py-3 rounded-lg border border-gray-300 text-black'
								placeholder={`activate ${deactivatedUsername || username}`}
								placeholderTextColor="#9ca3af"
								autoCapitalize='none'
								value={reactivatePromptText}
								onChangeText={setReactivatePromptText}
							/>

							<View className='mt-4 flex-row gap-3'>
								<TouchableOpacity
									className='flex-1 items-center justify-center rounded-lg border border-gray-300 py-3'
									onPress={() => setShowReactivateModal(false)}
									disabled={reactivating}
								>
									<Text className='font-semibold text-gray-700'>Back</Text>
								</TouchableOpacity>

								<TouchableOpacity
									className='flex-1 items-center justify-center rounded-lg bg-primary py-3'
									onPress={handleReactivate}
									disabled={reactivating}
								>
									{reactivating ? (
										<ActivityIndicator size="small" color="white" />
									) : (
										<Text className='font-semibold text-white'>Activate</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>

				<ActionConfirmModal
					visible={showSignupConfirmModal}
					title='Confirm Sign Up'
					message='Create your account using the details you entered?'
					confirmText='Create Account'
					cancelText='Review Details'
					onConfirm={submitSignup}
					onCancel={() => setShowSignupConfirmModal(false)}
					loading={loading}
				/>
			</SafeAreaView>
		</LinearGradient>
	)
}

export default LoginSignup