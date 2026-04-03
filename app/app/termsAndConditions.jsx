import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const TermsAndConditions = () => {
    return (
        <SafeAreaView className='flex-1 bg-main-form'>
            <View className='flex-row items-center justify-between px-6 py-4 border-b border-secondary-light'>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
                <Text className='text-primary text-xl font-semibold'>Terms and Conditions</Text>
                <View className='w-6' />
            </View>

            <ScrollView className='flex-1 px-6 py-4' showsVerticalScrollIndicator={false}>
                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>1. Order Accuracy</Text>
                    <Text className='text-secondary-strong'>Please ensure all order details are correct before submission, including contact information, pickup date, and cake specifications.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>2. Downpayment Requirement</Text>
                    <Text className='text-secondary-strong'>Pre-made orders require a 15% downpayment. Custom orders require a fixed P500.00 downpayment before production starts.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>3. Payment Reference Submission</Text>
                    <Text className='text-secondary-strong'>Submit a valid payment reference number after transferring payment to avoid delays in order verification.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>4. Pickup Scheduling</Text>
                    <Text className='text-secondary-strong'>Only available dates and times can be selected. The store may block dates due to capacity or store closure.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>5. Final Confirmation</Text>
                    <Text className='text-secondary-strong'>By proceeding with checkout, you acknowledge that you have reviewed and accepted these terms and conditions.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsAndConditions;
