import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const TermsOfService = () => {
    return (
        <SafeAreaView className='flex-1 bg-main-form'>
            <View className='flex-row items-center justify-between px-6 py-4 border-b border-secondary-light'>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
                <Text className='text-primary text-xl font-semibold'>Terms of Service</Text>
                <View className='w-6' />
            </View>

            <ScrollView className='flex-1 px-6 py-4' showsVerticalScrollIndicator={false}>
                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>1. Service Scope</Text>
                    <Text className='text-secondary-strong'>Cake Track allows customers to browse cakes, submit custom or pre-made orders, and manage pickup details.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>2. Order Review</Text>
                    <Text className='text-secondary-strong'>All submitted orders are subject to shop review and availability. The shop may contact you for clarifications before confirmation.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>3. Payment and Downpayment</Text>
                    <Text className='text-secondary-strong'>Downpayment is required to proceed with order processing. Balance settlement and payment proof requirements depend on order type and current order status.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>4. Pickup Responsibility</Text>
                    <Text className='text-secondary-strong'>Customers are responsible for collecting orders at the selected pickup date and time. Delays may require schedule adjustments depending on store operations.</Text>
                </View>

                <View className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                    <Text className='text-primary font-bold text-base mb-2'>5. Changes to Terms</Text>
                    <Text className='text-secondary-strong'>Terms may be updated from time to time. Continued use of the app means you accept the latest version of these terms.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsOfService;
