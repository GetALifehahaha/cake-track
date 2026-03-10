import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeClosed, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react-native';
import { useToast } from '@/context/ToastContext';
import api from '@/api/api';

const ForgotPassword = () => {
    const { showToast } = useToast();

    // Step: 1 = Enter email & send OTP, 2 = Enter OTP & verify, 3 = Set new password
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Step 2
    const [otp, setOtp] = useState('');
    const [token, setToken] = useState('');

    // Step 3
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (value) => {
        return String(value)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    // ============ STEP 1: Send OTP ============
    const handleSendOtp = async () => {
        if (!email.trim()) {
            showToast('Please enter your email address', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/request-otp/', { email: email.trim().toLowerCase() });

            if (res.status === 200) {
                showToast(res.data.details || 'OTP sent! Check your email.', 'success');
                setOtpSent(true);
                setStep(2);
            }
        } catch (err) {
            const data = err.response?.data;
            showToast(data?.details || 'Failed to send OTP. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============ STEP 2: Verify OTP ============
    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            showToast('Please enter the 6-digit OTP from your email', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/verify-otp/', { email: email.trim().toLowerCase(), otp: otp });

            if (res.status === 200) {
                showToast(res.data.details || 'OTP verified!', 'success');
                setToken(res.data.token);
                setStep(3);
            }
        } catch (err) {
            const data = err.response?.data;
            showToast(data?.details || 'Invalid or expired OTP. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const res = await api.post('/request-otp/', { email: email.trim().toLowerCase() });
            if (res.status === 200) {
                showToast('OTP resent! Check your email.', 'success');
            }
        } catch (err) {
            showToast('Failed to resend OTP.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============ STEP 3: Change Password ============
    const handleChangePassword = async () => {
        if (!newPassword) {
            showToast('Please enter your new password', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/change-password-token/', {
                email: email.trim().toLowerCase(),
                token: token,
                password: newPassword,
            });

            if (res.status === 200) {
                showToast('Password changed successfully! Please login.', 'success');
                setTimeout(() => {
                    router.replace('/(auth)/login');
                }, 1500);
            }
        } catch (err) {
            const data = err.response?.data;
            showToast(data?.details || 'Failed to change password. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

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
                    {/* Header */}
                    <View className='w-full items-center my-8 gap-4'>
                        <Image className='w-20 h-20 rounded-full' source={require('@/assets/images/logo.jpg')} />
                        <TouchableOpacity className='absolute top-4 left-4 p-4' onPress={handleBack}>
                            <ArrowLeft style={{ color: '#8B5A3C' }} />
                        </TouchableOpacity>
                        <Text className='text-xl font-bold text-primary'>Forgot Password</Text>
                        <Text className='text-md font-medium text-gray-600'>
                            Follow the steps to reset your password
                        </Text>
                    </View>

                    {/* Step Indicators */}
                    <View className='flex-row justify-center items-center gap-2 mb-6'>
                        {[1, 2, 3].map((s) => (
                            <View key={s} className='flex-row items-center gap-2'>
                                <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= s ? 'bg-secondary-strong' : 'bg-gray-300'}`}>
                                    <Text className='text-white font-bold text-sm'>{s}</Text>
                                </View>
                                {s < 3 && (
                                    <View className={`w-8 h-0.5 ${step > s ? 'bg-secondary-strong' : 'bg-gray-300'}`} />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Card */}
                    <View className='bg-white border border-gray-300 w-[90vw] self-center rounded-2xl'>

                        {/* ============ STEP 1: Enter Email ============ */}
                        {step === 1 && (
                            <View className='p-6 gap-3'>
                                <View className='items-center mb-4'>
                                    <View className='bg-secondary-light/20 p-4 rounded-full'>
                                        <Mail style={{ color: '#8B5A3C' }} size={32} />
                                    </View>
                                    <Text className='text-lg font-bold text-primary mt-3'>Enter Your Email</Text>
                                    <Text className='text-sm text-gray-500 text-center mt-1'>
                                        We'll send a 6-digit OTP to your email address
                                    </Text>
                                </View>

                                <View className='flex-row gap-2 items-center'>
                                    <Mail style={{ color: '#BE9B7B' }} size={16} />
                                    <Text>Email Address</Text>
                                </View>
                                <TextInput
                                    className='px-3 py-4 border border-secondary-light rounded-md'
                                    placeholder='Enter your email address'
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    value={email}
                                    onChangeText={setEmail}
                                    maxLength={50}
                                />

                                <TouchableOpacity
                                    className={`p-4 rounded-md mt-2 ${loading ? 'bg-secondary-strong/50' : 'bg-secondary-strong'}`}
                                    onPress={handleSendOtp}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className='text-center font-semibold text-white'>Send OTP</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity className='mt-4' onPress={() => router.replace('/(auth)/login')}>
                                    <Text className='text-center text-secondary-light font-medium'>Back to Login</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ============ STEP 2: Enter OTP ============ */}
                        {step === 2 && (
                            <View className='p-6 gap-3'>
                                <View className='items-center mb-4'>
                                    <View className='bg-secondary-light/20 p-4 rounded-full'>
                                        <ShieldCheck style={{ color: '#8B5A3C' }} size={32} />
                                    </View>
                                    <Text className='text-lg font-bold text-primary mt-3'>Verify OTP</Text>
                                    <Text className='text-sm text-gray-500 text-center mt-1'>
                                        Enter the 6-digit code sent to{'\n'}
                                        <Text className='font-semibold text-primary'>{email}</Text>
                                    </Text>
                                </View>

                                <View className='flex-row gap-2 items-center'>
                                    <ShieldCheck style={{ color: '#BE9B7B' }} size={16} />
                                    <Text>OTP Code</Text>
                                </View>
                                <TextInput
                                    className='px-3 py-4 border border-secondary-light rounded-md text-center text-xl tracking-[8px] font-bold'
                                    placeholder='000000'
                                    keyboardType='number-pad'
                                    value={otp}
                                    onChangeText={(text) => {
                                        if (text.length <= 6) setOtp(text);
                                    }}
                                    maxLength={6}
                                />

                                <TouchableOpacity
                                    className={`p-4 rounded-md mt-2 ${loading ? 'bg-secondary-strong/50' : 'bg-secondary-strong'}`}
                                    onPress={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className='text-center font-semibold text-white'>Verify OTP</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity className='mt-2' onPress={handleResendOtp} disabled={loading}>
                                    <Text className='text-center text-secondary-light font-medium'>
                                        Didn't receive it? <Text className='font-bold underline'>Resend OTP</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ============ STEP 3: New Password ============ */}
                        {step === 3 && (
                            <View className='p-6 gap-3'>
                                <View className='items-center mb-4'>
                                    <View className='bg-secondary-light/20 p-4 rounded-full'>
                                        <KeyRound style={{ color: '#8B5A3C' }} size={32} />
                                    </View>
                                    <Text className='text-lg font-bold text-primary mt-3'>Set New Password</Text>
                                    <Text className='text-sm text-gray-500 text-center mt-1'>
                                        Choose a strong password with at least 8 characters
                                    </Text>
                                </View>

                                <View className='flex-row gap-2 items-center'>
                                    <Lock style={{ color: '#BE9B7B' }} size={16} />
                                    <Text>New Password</Text>
                                </View>
                                <View className='px-3 py-1 border border-secondary-light rounded-md flex-row items-center'>
                                    <TextInput
                                        className='flex-1 py-3'
                                        placeholder='Enter new password'
                                        secureTextEntry={!showPassword}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeClosed style={{ color: 'gray' }} /> : <Eye style={{ color: 'gray' }} />}
                                    </TouchableOpacity>
                                </View>

                                <View className='flex-row gap-2 items-center mt-2'>
                                    <Lock style={{ color: '#BE9B7B' }} size={16} />
                                    <Text>Confirm Password</Text>
                                </View>
                                <View className='px-3 py-1 border border-secondary-light rounded-md flex-row items-center'>
                                    <TextInput
                                        className='flex-1 py-3'
                                        placeholder='Re-enter new password'
                                        secureTextEntry={!showPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeClosed style={{ color: 'gray' }} /> : <Eye style={{ color: 'gray' }} />}
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    className={`p-4 rounded-md mt-4 ${loading ? 'bg-secondary-strong/50' : 'bg-secondary-strong'}`}
                                    onPress={handleChangePassword}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className='text-center font-semibold text-white'>Change Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPassword;
