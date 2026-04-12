import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import React, { useState, useContext, useEffect } from 'react'
import { Lock, Mail, Eye, EyeClosed, User2Icon, Loader2, Phone } from 'lucide-react-native'
import { AuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { isValidEmail, hasMinCredentialLength, isPasswordSimilarToUsername, isValidPHPhoneNumber, formatPhoneNumber, normalizePhoneNumber } from '@/utils/validators';
// 1. Import Google Sign-In
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const LoginSignup = ({ method }) => {
	const { showToast } = useToast();
	// 2. Destructure googleLogin from context
	const { login, loading: authLoading, register, reactivateAccount } = useContext(AuthContext)

	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Signup specific
	const [firstName, setFirstName] = useState("");
	const [middleName, setMiddleName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [username, setUsername] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [loading, setLoading] = useState(false);
	const [reactivating, setReactivating] = useState(false);
	const [showReactivateModal, setShowReactivateModal] = useState(false);
	const [reactivatePromptText, setReactivatePromptText] = useState('');
	const [deactivatedUsername, setDeactivatedUsername] = useState('');

	const validateCredentialRules = () => {
		if (!hasMinCredentialLength(username)) {
			showToast("Username must be at least 8 characters", "error");
			return false;
		}

		if (!hasMinCredentialLength(password)) {
			showToast("Password must be at least 8 characters", "error");
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

	const submitForm = async () => {
		try {
			setLoading(true);
			if (method === "login") {
				if (!username || !password) {
					showToast("Please fill in all fields", "error");
					return;
				}

				if (!validateCredentialRules()) {
					return;
				}

				const res = await login(username, password)

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

			} else if (method === "signup") {
				if (!firstName || !middleName || !lastName || !emailAddress || !phoneNumber || !username || !password || !confirmPassword) {
					showToast("Please fill in all fields", "error");
					return;
				}

				if (!isValidEmail(emailAddress)) {
					showToast("Please enter a valid email address", "error");
					return;
				}

				if (!isValidPHPhoneNumber(phoneNumber)) {
					showToast("Please enter a valid phone number", "error");
					return;
				}

				if (password !== confirmPassword) {
					showToast("Passwords do not match", "error");
					return;
				}

				if (!validateCredentialRules()) {
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
					showToast("Signed up successfully! Login with your credentials", "success");
					router.replace('/(auth)/login');
				}

				if (res.error) {
					showToast(res.error, "error");
				}
			}


		} catch (error) {
			showToast(error.message || "Login failed", "error")
		}
		finally {
			setLoading(false);
		}
	}

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

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
			>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View className='w-full items-center my-8 gap-4'>
						<Image className='w-20 h-20 rounded-full' source={require('@/assets/images/logo.jpg')} />
						<TouchableOpacity className='absolute top-4 right-4 p-4 rounded-m w-fit mx-auto mb-4' onPress={() => router.replace('/(tabs)/')}>
							<Text className='text-center font-semibold text-secondary-light'>BACK</Text>
						</TouchableOpacity>
						<Text className='text-xl font-bold text-primary'>
							Michelle's Cakes & Cafe
						</Text>
						<Text className='text-md font-medium text-gray-600'>
							Order your perfect custom cake
						</Text>
					</View>

					<View className='bg-white border border-gray-300 w-[90vw] self-center rounded-2xl mb-10'>
						{/* Tabs */}
						<View className='flex-row border-b border-gray-500'>
							<TouchableOpacity className={`flex-1 p-6 ${method === "login" ? 'border-b-2 border-secondary-light' : ''}`} onPress={() => router.replace('/(auth)/login')}>
								<Text className={`text-lg font-medium text-center ${method === "login" ? 'text-secondary-strong' : 'text-gray-300'}`}>
									Login
								</Text>
							</TouchableOpacity>
							<TouchableOpacity className={`flex-1 p-6 ${method === "signup" ? 'border-b-2 border-secondary-light' : ''}`} onPress={() => router.replace('/(auth)/signup')}>
								<Text className={`text-lg font-medium text-center ${method === "signup" ? 'text-secondary-strong' : 'text-gray-300'}`}>
									Sign Up
								</Text>
							</TouchableOpacity>
						</View>

						{/* LOGIN FORM */}
						{method === "login" &&
							<View className='p-6 gap-2'>
								<Text className='text-center text-black font-semibold'>
									Welcome back! Please login to continue
								</Text>

								<View className='h-0.5 w-full bg-gray-300 my-8' />

								<View className='flex-row gap-2 items-center'>
									<User2Icon style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Username</Text>
								</View>
								<TextInput
									className='px-2 py-4 mb-4 border border-secondary-light rounded-md text-black'
									placeholder='Enter your username'
									placeholderTextColor="#9ca3af"
									autoCapitalize="none"
									value={username}
									onChangeText={setUsername}
								/>

								<View className='flex-row gap-2 items-center'>
									<Lock style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Password</Text>
								</View>

								<View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
									<TextInput className='flex-1 text-black' placeholder="Enter password" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword}
										value={password} onChangeText={setPassword} />
									<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
										{showPassword ? <Eye style={{ color: 'gray' }} /> : <EyeClosed style={{ color: 'gray' }} />}
									</TouchableOpacity>
								</View>

								{loading ?
									<View className='p-4 rounded-md bg-secondary-strong flex-row justify-center items-center opacity-50'>
										<Loader2 size={16} color="#fff" className="animate-spin" />
										<Text className='text-center font-semibold text-white ml-2'>Processing...</Text>
									</View>
									:
									<TouchableOpacity className='p-4 rounded-md bg-secondary-strong ' onPress={submitForm}>
										<Text className='text-center font-semibold text-white'>LOGIN</Text>
									</TouchableOpacity>
								}

								<TouchableOpacity className='mt-3' onPress={() => router.push('/(auth)/forgotPassword')}>
									<Text className='text-center text-secondary-light font-medium'>Forgot Password?</Text>
								</TouchableOpacity>
							</View>
						}

						{/* SIGNUP FORM */}
						{method === "signup" &&
							<View className='p-6 gap-2'>
								<Text className='text-center text-black font-semibold'>
									Create an account to start ordering!
								</Text>

								{/* 6. GOOGLE LOGIN BUTTON (Signup) */}
								{/* <TouchableOpacity 
                  onPress={handleGoogleSignIn}
                  className="bg-white border border-gray-300 flex-row items-center justify-center p-3 rounded-md mt-4 shadow-sm"
                >
                  <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }} 
                    style={{ width: 20, height: 20, marginRight: 10 }} 
                  />
                  <Text className="text-gray-700 font-semibold">Sign up with Google</Text>
                </TouchableOpacity> */}

								<View className='h-0.5 w-full bg-gray-300 my-8' />

								<View className='flex-row gap-2 items-center'>
									<Mail style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>First Name</Text>
								</View>
								<TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md text-black' placeholder='Enter your first name' placeholderTextColor="#9ca3af" value={firstName} onChangeText={setFirstName} />

								<View className='flex-row gap-2 items-center'>
									<Mail style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Middle Name</Text>
								</View>
								<TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md text-black' placeholder='Enter your middle name' placeholderTextColor="#9ca3af" value={middleName} onChangeText={setMiddleName} />

								{/* ... rest of signup form inputs ... */}
								<View className='flex-row gap-2 items-center'>
									<Mail style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Last Name</Text>
								</View>
								<TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md text-black' placeholder='Enter your last name' placeholderTextColor="#9ca3af" value={lastName} onChangeText={setLastName} />

								<View className='flex-row gap-2 items-center'>
									<Phone style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Phone Number</Text>
								</View>
								<TextInput
									className='px-2 py-4 mb-4 border border-secondary-light rounded-md text-black'
									placeholder='0912 345 6789'
									placeholderTextColor="#9ca3af"
									value={phoneNumber}
									onChangeText={handlePhoneNumberChange}
									keyboardType='number-pad'
									maxLength={13}
								/>

								<View className='flex-row gap-2 items-center'>
									<Mail style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Email Address</Text>
								</View>
								<TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md text-black' placeholder='Enter your email address' placeholderTextColor="#9ca3af" value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" />

								<View className='flex-row gap-2 items-center'>
									<User2Icon style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Username</Text>
								</View>
								<TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md text-black' placeholder='Enter your username' placeholderTextColor="#9ca3af" value={username} onChangeText={setUsername} autoCapitalize="none" />

								<View className='flex-row gap-2 items-center'>
									<Lock style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Password</Text>
								</View>
								<View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
									<TextInput className='flex-1 text-black' placeholder="Enter password" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword}
										value={password} onChangeText={setPassword} />
									<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
										{showPassword ? <Eye style={{ color: 'gray' }} /> : <EyeClosed style={{ color: 'gray' }} />}
									</TouchableOpacity>
								</View>

								<View className='flex-row gap-2 items-center'>
									<Lock style={{ color: "#BE9B7B" }} size={16} />
									<Text className=''>Confirm Password</Text>
								</View>
								<View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
									<TextInput className='flex-1 text-black' placeholder="Re-enter your password" placeholderTextColor="#9ca3af" secureTextEntry={!showPassword}
										value={confirmPassword} onChangeText={setConfirmPassword} />
									<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
										{showPassword ? <Eye style={{ color: 'gray' }} /> : <EyeClosed style={{ color: 'gray' }} />}
									</TouchableOpacity>
								</View>

								{loading ?
									<View className='p-4 rounded-md bg-secondary-strong flex-row justify-center items-center opacity-50'>
										<Loader2 size={16} color="#fff" className="animate-spin" />
										<Text className='text-center font-semibold text-white ml-2'>Processing...</Text>
									</View>
									:
									<TouchableOpacity className='p-4 rounded-md bg-secondary-strong ' onPress={submitForm}>
										<Text className='text-center font-semibold text-white'>SIGN UP</Text>
									</TouchableOpacity>
								}
							</View>
						}
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
		</SafeAreaView>
	)
}

export default LoginSignup