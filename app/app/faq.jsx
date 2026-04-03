import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const FAQ = () => {
    const faqs = [
        {
            question: 'How far in advance should I place an order?',
            answer: 'For pre-made cakes, place your order at least 1 day ahead. For custom cakes, we recommend 3 to 7 days ahead depending on design complexity.'
        },
        {
            question: 'How much is the downpayment?',
            answer: 'Pre-made orders require a 15% downpayment. Custom orders require a fixed downpayment of P500.00.'
        },
        {
            question: 'Can I choose my pickup date and time?',
            answer: 'Yes. You can select your preferred pickup date and time during checkout, subject to available slots and blocked dates.'
        },
        {
            question: 'Can I cancel or edit my order after submitting?',
            answer: 'Please contact the shop as soon as possible. Changes and cancellations depend on order status and preparation progress.'
        },
        {
            question: 'Where can I submit my payment reference number?',
            answer: 'After payment, open your order details and enter your reference number in the provided field.'
        }
    ];

    return (
        <SafeAreaView className='flex-1 bg-main-form'>
            <View className='flex-row items-center justify-between px-6 py-4 border-b border-secondary-light'>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
                <Text className='text-primary text-xl font-semibold'>FAQ</Text>
                <View className='w-6' />
            </View>

            <ScrollView className='flex-1 px-6 py-4' showsVerticalScrollIndicator={false}>
                <Text className='text-secondary-light mb-4'>Frequently asked questions about ordering and pickup.</Text>

                {faqs.map((item, index) => (
                    <View key={index} className='mb-4 p-4 rounded-xl border border-secondary-light bg-white'>
                        <Text className='text-primary font-bold text-base mb-2'>{item.question}</Text>
                        <Text className='text-secondary-strong'>{item.answer}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default FAQ;
