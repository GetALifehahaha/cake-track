import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';

const FAQ = () => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const faqTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');

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

    const toggleExpanded = (index) => {
        setExpandedIndex((previous) => (previous === index ? null : index));
    };

    return (
        <ImageBackground source={faqTexture} style={{ flex: 1 }} resizeMode='repeat'>
            <SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <View className='flex-row items-center justify-between px-6 py-4 border-b border-secondary-light bg-white/90'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft style={{ color: '#8B5A3C' }} />
                    </TouchableOpacity>
                    <Text className='text-primary text-xl font-semibold'>FAQ</Text>
                    <View className='w-6' />
                </View>

                <ScrollView className='flex-1 px-5 pt-4' showsVerticalScrollIndicator={false}>
                    <View className='mb-4 rounded-2xl bg-[#FFF7EA] border border-[#E6BE86] p-4'>
                        <Text className='text-primary text-lg font-extrabold'>Frequently Asked Questions</Text>
                        <Text className='text-secondary-strong text-sm mt-1'>Tap each question to view the answer.</Text>
                    </View>

                    {faqs.map((item, index) => {
                        const isExpanded = expandedIndex === index;

                        return (
                            <TouchableOpacity
                                key={item.question}
                                className='mb-3 rounded-2xl border border-[#E7D8C8] bg-white px-4 py-4'
                                activeOpacity={0.9}
                                onPress={() => toggleExpanded(index)}
                            >
                                <View className='flex-row items-start justify-between gap-3'>
                                    <Text className='text-primary font-bold text-base flex-1'>{item.question}</Text>
                                    <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                                        <ChevronDown color='#8B5A3C' size={20} />
                                    </View>
                                </View>

                                {isExpanded && (
                                    <Text className='text-secondary-strong leading-6 border-t border-[#EEE4D8] mt-3 pt-3'>
                                        {item.answer}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                    <View className='h-4' />
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default FAQ;
