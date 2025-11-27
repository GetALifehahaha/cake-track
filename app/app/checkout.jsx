import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import FormLabel from '@/components/atoms/FormLabel';
import DatePicker from '@/components/atoms/DatePicker';
import Checkbox from '@/components/atoms/Checkbox';

const Checkout = () => {

    const { cart, setAmount } = useCart();
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState();
    const [dueDate, setDueDate] = useState();
    const [agreeToTOC, setAgreeToTOC] = useState(false);

    const listCartItems = cart.map((item, index) =>
        <View key={index} className='w-full flex-row items-center justify-between py-6'>
            <Text className='font-bold text-lg'>
                {item.name}
            </Text>

            <View
                className='flex-row items-center justify-between px-3 h-8 border-secondary-strong border rounded-full'
                style={{ width: 90 }}
            >
                <TouchableOpacity onPress={() => setAmount(item.id, "minus")}>
                    <Minus size={16} style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>

                <Text className='font-bold text-base text-black'>
                    {item.amount}
                </Text>

                <TouchableOpacity onPress={() => setAmount(item.id, "add")}>
                    <Plus size={16} style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <SafeAreaView className='flex-1 bg-main-form'>
            <ScrollView>
                <View className='flex-1'>
                    <View className='w-full flex-row justify-between items-center pb-4 mt-6 px-6 border-b border-b-gray-300'>
                        <TouchableOpacity onPress={() => router.back()}><ArrowLeft style={{ color: '#8B5A3C' }} /></TouchableOpacity>
                        <Text className='text-2xl font-semibold text-primary'>Order Details</Text>
                        <View className='w-8' />
                    </View>

                    <View className='p-4' >
                        <View className='p-8 rounded-lg border border-secondary-light'>
                            <Text className='font-extrabold text-primary'>Contact Details</Text>
                            <Text className='font-medium text-secondary-light mb-4'>Submit your details for communication</Text>

                            <FormLabel text={"Full Name"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={fullName} onChangeText={setFullName} placeholder='Juan Dela Cruz' />
                            <FormLabel text={"Address"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={address} onChangeText={setAddress} placeholder='Juan Dela Cruz' />
                            <FormLabel text={"Email"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={email} onChangeText={setEmail} placeholder='Juan Dela Cruz' />
                            <FormLabel text={"Phone Number"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={phoneNumber} onChangeText={setPhoneNumber} placeholder='Juan Dela Cruz' />
                            <FormLabel text={"Due Date"} />
                            <DatePicker onSelectDate={setDueDate} />
                            <View className='mt-4 flex-row gap-2 p-4 rounded-md border border-secondary-light items-center'>
                                <Checkbox value={agreeToTOC} onChange={setAgreeToTOC} />
                                <Text className='font-medium text-secondary-strong'>I agree to the terms and conditions</Text>
                            </View>
                        </View>

                        <View className='p-6'>
                            <Text className='text-primary font-bold text-xl'>Order Summary</Text>
                            <Text className='text-secondary-strong'>{cart.length} {cart.length > 1 ? 'items' : 'item'}</Text>

                            <View>
                                {listCartItems}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View className='w-full h-40 p-6 bg-white border-y border-secondary-light'>
                <TouchableOpacity className='w-full bg-secondary-light rounded-full flex-row items-center gap-4 p-4' onPress={() => router.push('/checkout')}>
                    <View className='bg-white rounded-full h-8 w-8 items-center justify-center'>
                        <Text className='font-bold text-secondary-strong'>{cart.length}</Text>
                    </View>
                    <Text className='font-bold text-lg text-white'>Submit Order</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Checkout