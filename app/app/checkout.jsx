import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import React, { useContext, useState, useCallback, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Minus, Plus, MapPin } from 'lucide-react-native';
import FormLabel from '@/components/atoms/FormLabel';
import DatePicker from '@/components/atoms/DatePicker';
import TimePicker from '@/components/atoms/TimePicker';
import Checkbox from '@/components/atoms/Checkbox';
import ConfirmModal from '@/components/organisms/ConfirmModal';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import useOrder from '@/hooks/useOrder';
import api from '@/api/api';
import { locationStore } from '@/utils/locationStore';
import { formatPhoneNumber, isValidEmail, isValidPHPhoneNumber } from '@/utils/validators';

const Checkout = () => {

    const { showToast } = useToast();
    const { user } = useContext(AuthContext);
    const { cart, setAmount, setCart } = useCart();
    const router = useRouter();

    const { postOrder } = useOrder();

    const [fullName, setFullName] = useState(`${user?.first_name || ''} ${user?.last_name || ''}`.trim());
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState(user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(user?.phone_number || ""));
    const [dueDate, setDueDate] = useState();
    const [pickupTime, setPickupTime] = useState();
    const [agreeToTOC, setAgreeToTOC] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.phone_number && !String(phoneNumber || '').trim()) {
            setPhoneNumber(formatPhoneNumber(String(user.phone_number)));
        }
    }, [user?.phone_number, phoneNumber]);

    // Listen for address selected from locationPicker (via locationStore)
    useFocusEffect(
        useCallback(() => {
            const addr = locationStore.consumeAddress();
            if (addr) {
                setAddress(addr);
            }
        }, [])
    );

    const validateContactDetails = () => {
        if (!fullName.trim()) {
            showToast("Please enter your full name", 'error');
            return false;
        }

        if (!phoneNumber.trim()) {
            showToast("Please enter your contact number", 'error');
            return false;
        } else if (!isValidPHPhoneNumber(phoneNumber)) {
            showToast("Number must be a valid contact number", 'error');
            return false;
        }

        if (!email.trim()) {
            showToast("Please enter your email address", 'error');
            return false;
        } else if (!isValidEmail(email)) {
            showToast("Please enter a valid email address", 'error');
            return false;
        }

        if (!address.trim()) {
            showToast("Please enter your address", 'error');
            return false;
        }

        if (!dueDate) {
            showToast("Please select a pickup date", 'error');
            return false;
        }

        if (!pickupTime) {
            showToast("Please select a pickup time", 'error');
            return false;
        }

        if (!agreeToTOC) {
            showToast("You must agree to the Terms and Conditions to proceed", 'error');
            return false;
        }

        return true
    }

    const handleContactNumber = (text) => {
        setPhoneNumber(formatPhoneNumber(text))
    }

    // const handlePayViaGCash = async (orderId) => {
    //     try {
    //         showToast("Initiating GCash payment...", "info");
    //         const payload = { order_id: orderId };

    //         const response = await api.post(`/payment/initiate/`, payload);
    //         const { checkout_url } = response.data;

    //         if (checkout_url) {
    //             router.push({
    //                 pathname: '/paymentScreen',
    //                 params: { checkoutUrl: checkout_url, orderId: orderId }
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Payment Error:", error.response?.data || error.message);
    //         showToast("Error initiating payment. You can retry from your orders.", "error");
    //         router.replace('/(tabs)/orders');
    //     }
    // };

    const orderCake = async () => {

        if (!validateContactDetails()) return;

        setIsSubmitting(true);

        try {
            const cartItemsString = cart.map(item => `${item.amount}x ${item.name}`).join(', ');
            const premadeTotal = cart.reduce((sum, item) => sum + (item.price * item.amount), 0);

            // Format dates for Django (YYYY-MM-DD and HH:MM:SS)
            const formattedDate = dueDate instanceof Date ? dueDate.toISOString().split('T')[0] : dueDate;
            const formattedTime = pickupTime instanceof Date ? pickupTime.toTimeString().split(' ')[0] : pickupTime;

            // 2. Retrieve image URLs directly from the cart items
            const cartImages = cart.map(item => item.image.uri);

            const payload = {
                full_name: fullName,
                email: email,
                phone_number: phoneNumber,
                address: address,
                due_date: formattedDate,
                pickup_time: formattedTime,
                cake_orders: {
                    occasion: "pre-made",
                    shape: "N/A",
                    cake_tier: 1,
                    base_flavor: cartItemsString,
                    filling: "N/A",
                    coating_color: "N/A",
                    border: "N/A",
                    border_color: "N/A",
                    toppings: "none",
                    addons: "none",
                    message_type: "N/A",
                    message: "N/A"
                },
                comments: "N/A",
                premade_items: cart.map(item => ({
                    cake_id: item.id,
                    quantity: item.amount || 1,
                })),
                total_price: premadeTotal,
                image: cartImages.length > 0 ? cartImages[0] : null,
                uploaded_images: cartImages
            };

            const response = await postOrder(payload);
            const newOrderId = response?.id || response?.data?.id;

            const downpaymentAmount = (premadeTotal * 0.15).toFixed(2);

            setCart([]);

            router.replace({
                pathname: '/gcashInformation',
                params: {
                    amount: downpaymentAmount,
                    paymentType: 'cake',
                    orderId: newOrderId || '',
                },
            })

            // if (newOrderId) {
            //     await handlePayViaGCash(newOrderId);
            // } else {
            //     showToast("Order placed, but ID missing. Check Order History.");
            //     router.replace('/orderSuccess');
            // }

        } catch (error) {
            console.error("Order Submission Error:", error.response?.data || error);
            showToast("Failed to place order. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    const listCartItems = cart.map((item, index) =>
        <View key={index} className='w-full flex-row items-center justify-between py-6'>
            <View className='flex-row items-center gap-4'>
                <Text className='font-bold text-lg'>
                    {item.name}
                </Text>
                <Text className='font-semibold text-gray-600 text-md'>
                    ₱ {(item.price)}
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

    if (isSubmitting) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#8B5A3C" />
                <Text className="text-secondary-light mt-2">Processing Order...</Text>
            </View>
        );
    }

    const cartTotal = cart.reduce((total, item) => total + (item.price * (item.amount || 1)), 0);
    const downpayment = cartTotal * 0.15;

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
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-1 mt-1 bg-white' value={address} onChangeText={setAddress} placeholder='123 Main St. City, Province' />
                            <TouchableOpacity
                                className='flex-row items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-secondary-light/10 border border-secondary-light/30 self-start'
                                onPress={() => router.push({ pathname: '/locationPicker', params: { currentAddress: address } })}
                            >
                                <MapPin size={16} style={{ color: '#8B5A3C' }} />
                                <Text className='text-primary font-medium text-sm'>Pick from saved locations</Text>
                            </TouchableOpacity>
                            <FormLabel text={"Email"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={email} onChangeText={setEmail} placeholder='juan@example.com' />
                            <FormLabel text={"Phone Number"} />
                            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mb-2 mt-1 bg-white' value={phoneNumber} onChangeText={handleContactNumber} placeholder='Enter your phone number' maxLength={18} keyboardType='number-pad' />

                            <FormLabel text={"Pickup Date"} />
                            <DatePicker onSelectDate={setDueDate} />

                            <View className='mt-2' />
                            <FormLabel text={"Pickup Time"} />
                            <TimePicker onSelectTime={setPickupTime} />

                            <View className='mt-4 flex-row gap-2 p-4 rounded-md border border-secondary-light items-center'>
                                <Checkbox value={agreeToTOC} onChange={setAgreeToTOC} />
                                <Text className='font-medium text-secondary-strong flex-1'>
                                    I agree to the{' '}
                                    <Text className='font-bold text-primary' onPress={() => router.push('/termsAndConditions')}>
                                        terms and conditions
                                    </Text>
                                </Text>
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
                                    ₱ {cartTotal.toFixed(2)}
                                </Text>
                            </View>

                            <View className='px-4 pb-2 w-full flex-row justify-end items-center gap-4'>
                                <Text className='text-secondary-light font-semibold text-lg'>Downpayment (15%): </Text>
                                <Text className='text-primary font-semibold text-xl'>₱ {downpayment.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View className='w-full h-40 p-6 bg-white border-y border-secondary-light'>
                <ConfirmModal
                    details={`You are about to pay ₱ ${downpayment.toFixed(2)} as downpayment (15%).`}
                    onConfirm={orderCake}>
                    <View className='w-full bg-secondary-light rounded-full flex-row items-center gap-4 p-4'>
                        <View className='bg-white rounded-full h-8 px-4 items-center justify-center'>
                            <Text className='font-semibold text-secondary-strong'>₱ {downpayment.toFixed(2)}</Text>
                        </View>
                        <Text className='font-bold text-lg text-white'>Submit Order</Text>
                    </View>
                </ConfirmModal>
            </View>
        </SafeAreaView>
    )
}

export default Checkout