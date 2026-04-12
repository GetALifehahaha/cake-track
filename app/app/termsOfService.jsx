import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';

const TermsOfService = () => {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const termsTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');

    const sections = [
        {
            title: 'Service Scope',
            content: 'Cake Track allows customers to browse cakes, submit custom or pre-made orders, and manage pickup details.'
        },
        {
            title: 'Order Review',
            content: 'All submitted orders are subject to shop review and availability. The shop may contact you for clarifications before confirmation.'
        },
        {
            title: 'Payment and Downpayment',
            content: 'Downpayment is required to proceed with order processing. Balance settlement and payment proof requirements depend on order type and current order status.'
        },
        {
            title: 'Pickup Responsibility',
            content: 'Customers are responsible for collecting orders at the selected pickup date and time. Delays may require schedule adjustments depending on store operations.'
        },
        {
            title: 'Changes to Terms',
            content: 'Terms may be updated from time to time. Continued use of the app means you accept the latest version of these terms.'
        },
    ];

    const toggleExpanded = (index) => {
        setExpandedIndex((previous) => (previous === index ? null : index));
    };

    return (
        <ImageBackground source={termsTexture} style={{ flex: 1 }} resizeMode='repeat'>
            <SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <View className='flex-row items-center justify-between px-6 py-4 border-b border-secondary-light bg-white/90'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft style={{ color: '#8B5A3C' }} />
                    </TouchableOpacity>
                    <Text className='text-primary text-xl font-semibold'>Terms of Service</Text>
                    <View className='w-6' />
                </View>

                <ScrollView className='flex-1 px-5 pt-4' showsVerticalScrollIndicator={false}>
                    <View className='mb-4 rounded-2xl bg-[#FFF7EA] border border-[#E6BE86] p-4'>
                        <Text className='text-primary text-lg font-extrabold'>Terms of Service</Text>
                        <Text className='text-secondary-strong text-sm mt-1'>Review the important rules when using CakeTrack.</Text>
                    </View>

                    {sections.map((section, index) => {
                        const isExpanded = expandedIndex === index;

                        return (
                            <TouchableOpacity
                                key={section.title}
                                className='mb-3 rounded-2xl border border-[#E7D8C8] bg-white px-4 py-4'
                                activeOpacity={0.9}
                                onPress={() => toggleExpanded(index)}
                            >
                                <View className='flex-row items-start justify-between gap-3'>
                                    <Text className='text-primary font-bold text-base flex-1'>{index + 1}. {section.title}</Text>
                                    <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                                        <ChevronDown color='#8B5A3C' size={20} />
                                    </View>
                                </View>

                                {isExpanded && (
                                    <Text className='text-secondary-strong leading-6 border-t border-[#EEE4D8] mt-3 pt-3'>
                                        {section.content}
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

export default TermsOfService;
