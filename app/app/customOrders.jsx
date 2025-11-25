import './global.css';
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

const CustomOrders = () => {
    const [customDisplay, setCustomDisplay] = useState();
    const router = useRouter();

    
    return (
        <SafeAreaView className='flex-1 bg-[#8B5A3C] items-center justify-center'>
            <View className='flex-1 p-8 pt-16'>
                <View className='aspect-square w-full bg-white rounded-lg justify-center items-center'>
                    {customDisplay ? (
                        <Text className='font-bold text-3xl text-center'>Custom Order: {customDisplay}</Text>
                    ) : (
                        <Text className='text-sm font-semibold text-gray-300'>CAKE PREVIEW</Text>
                    )}
                </View>
            </View>

            <View className='bg-white w-full flex-1 rounded-t-[3rem]'>
                {/* Header */}
                <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                    <View>
                        <Text className='text-2xl font-semibold text-[#8B5A3C]'>Cake Details</Text>
                        <Text className='text-[#9A8978]'>Customize you perfect cake</Text>
                    </View>

                    <TouchableOpacity onPress={() => router.back()}><X /></TouchableOpacity>
                </View>

                {/* Occasion */}
            </View>
        </SafeAreaView>
    )
}

export default CustomOrders