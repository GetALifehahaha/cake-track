import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useContext, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import FormLabel from '@/components/atoms/FormLabel';
import DatePicker from '@/components/atoms/DatePicker';
import Checkbox from '@/components/atoms/Checkbox';
import ConfirmModal from '@/components/organisms/ConfirmModal';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const Checkout = () => {
    
    const {showToast} = useToast();
    const {user} = useContext(AuthContext);
    const { cart, setAmount, setCart } = useCart();
    const router = useRouter();
    const [fullName, setFullName] = useState(`${user?.first_name} ${user?.last_name}` || "");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState(user.email || "");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dueDate, setDueDate] = useState();
    const [agreeToTOC, setAgreeToTOC] = useState(false);

    const validateContactDetails = () => {
        if (!fullName.trim()) {
            showToast("Please enter your full name", 'error');
            return false;
        }
        // 1. Remove all spaces and dashes
        const cleanedNumber = phoneNumber.replace(/[\s-]/g, '');

        // 2. Validate the clean version
        const phoneRegex = /^\+63\d{10}$/;

        if (!phoneNumber.trim()) {
            showToast("Please enter your contact number", 'error');
            return false;
        } else if (!phoneRegex.test(cleanedNumber.trim())) {
            showToast("Number must start with +63 followed by 10 digits", 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            showToast("Please enter your email address", 'error');
            return false;
        } else if (!emailRegex.test(email.trim())) {
            showToast("Please enter a valid email address", 'error');
            return false;
        }

        if (!address.trim()) {
            showToast("Please enter your address", 'error');
            return false;
        }
        if (!agreeToTOC) {
            showToast("You must agree to the Terms and Conditions to proceed", 'error');
            return false;
        }

        return true
    }

    const orderCake = () => {
        if (!validateContactDetails()) return;
    }

    const listCartItems = cart.map((item, index) =>
        <View key={index} className='w-full flex-row items-center justify-between py-6'>
            <View className='flex-row items-center gap-4'>
                <Text className='font-bold text-lg'>
                    {item.name}
                </Text>
                <Text className='font-semibold text-gray-600 text-md'>
                    ₱ {(item.price).toFixed(2)}
                </Text>
            </View>

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
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={address} onChangeText={setAddress} placeholder='123 Main St. City, Province' />
                            <FormLabel text={"Email"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={email} onChangeText={setEmail} placeholder='juan@example.com' />
                            <FormLabel text={"Phone Number"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={phoneNumber} onChangeText={setPhoneNumber} placeholder='+63 912 345 6789' />
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

                            <View className='p-4 w-full border-t border-secondary-light flex-row justify-end items-center gap-4'>
                                <Text className='text-secondary-light font-semibold text-xl'>Total: </Text>
                                <Text className='text-primary font-semibold text-2xl'>
                                    ₱ {cart.reduce((total, item) => {
                                        return total + (item.price * (item.amount || 1));
                                    }, 0).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View className='w-full h-40 p-6 bg-white border-y border-secondary-light'>
                <ConfirmModal
                    details={`You are about to pay ₱ ${(cart.reduce((sum, item) => {
                        return sum + (item.price * item.amount);
                    }, 0)).toFixed(2)}`}
                    onConfirm={orderCake}>
                    <View className='w-full bg-secondary-light rounded-full flex-row items-center gap-4 p-4'>
                        <View className='bg-white rounded-full h-8 px-4 items-center justify-center'>
                            <Text className='font-semibold text-secondary-strong'>₱ {(cart.reduce((sum, item) => {
                                return sum + (item.price * item.amount);
                            }, 0)).toFixed(2)}</Text>
                        </View>
                        <Text className='font-bold text-lg text-white'>Submit Order</Text>
                    </View>
                </ConfirmModal>
            </View>
        </SafeAreaView>
    )
}

export default Checkout