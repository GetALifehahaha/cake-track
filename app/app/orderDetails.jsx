import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cake, Mail, NotepadText, CakeIcon, ArrowLeft, XCircle } from 'lucide-react-native';
import { capitalize } from '@/utils/capitalize';
import { parseTimeString } from '@/utils/time';
import { useToast } from '@/context/ToastContext';
import api from '@/api/api';
import { useEffect, useState } from 'react';

const getReferenceDigits = (value = '') => value.replace(/\D/g, '').slice(0, 15);

const formatReferenceNumber = (value = '') => {
    const digits = getReferenceDigits(value);

    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 12) return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;

    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12)}`;
};

const OrderDetails = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { showToast } = useToast();
    const [referenceNumber, setReferenceNumber] = useState('');
    const [submittingReference, setSubmittingReference] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const { width } = Dimensions.get('window');
    const imageSize = (width - 32 - 16) / 3;

    // 1. We receive the data as a JSON string stringified in the Card
    // We need to parse it back to an object
    let order = {};
    try {
        order = JSON.parse(params.orderData);
    } catch (e) {
        console.error("Error parsing order data", e);
    }

    // Use local state so UI updates immediately after cancel
    const currentStatus = orderStatus ?? order.status;

    // 2. Destructure the API data to match the variable names in your JSX
    // We handle potential null values safely here
    const {
        cake_orders = {},
        full_name: fullName,
        phone_number: contactNumber,
        email,
        address,
        due_date: dueDate,
        pickup_time: pickupTime,
        comments = "",
        image,
        order_images = [],
        reference_number: existingReferenceNumber,
    } = order;

    useEffect(() => {
        if (existingReferenceNumber) {
            setReferenceNumber(formatReferenceNumber(existingReferenceNumber));
        }
    }, [existingReferenceNumber]);

    const displayImages = order_images.length > 0
        ? order_images.map(img => img.image_url)
        : (image ? [image] : []);

    // 3. Extract cake specifics (handling if cake_orders is null)
    const {
        occasion = "",
        specifyOccasion = "",
        shape = "",
        cake_tier: tier = 0,
        base_flavor: baseFlavor = "",
        filling = "",
        coating_color: coatingColor = "",
        border = "",
        border_color: borderColor = "",
        message_type: messageType = "none",
        message = "",
    } = cake_orders || {};

    // Logic for cupcakes (based on your JSX)
    const hasCupcakes = !!order.cupcake_orders; // Check your API structure for this
    const cupcakesCount = order.cupcake_orders?.count || 0;
    const cupcakesFrosting = order.cupcake_orders?.frosting || "";

    const handleImagePress = (imgUri) => {
        router.push({
            pathname: '/imagePreview',
            params: { uri: imgUri }
        });
    };

    const handleReferenceNumberChange = (text) => {
        setReferenceNumber(formatReferenceNumber(text));
    };

    const referenceDigitsCount = getReferenceDigits(referenceNumber).length;
    const isReferenceNumberComplete = referenceDigitsCount >= 13 && referenceDigitsCount <= 15;

    const handlePostReferenceNumber = async () => {
        if (submittingReference) return;

        const normalizedReference = getReferenceDigits(referenceNumber);
        if (normalizedReference.length < 13 || normalizedReference.length > 15) {
            showToast('Reference number must be 13 to 15 digits', 'error');
            return;
        }

        setSubmittingReference(true);
        try {
            await api.patch(`/orders/orders/${order.id}/`, {
                reference_number: normalizedReference,
            });
            setReferenceNumber(formatReferenceNumber(normalizedReference));
            showToast('Reference number submitted successfully.', 'success');
        } catch (error) {
            console.error('Reference Number Error:', error.response?.data || error.message);
            showToast(error.response?.data?.error || 'Failed to update order', 'error');
        } finally {
            setSubmittingReference(false);
        }
    };

    const handleCancel = async () => {
        if (cancelling) return;
        setCancelling(true);
        try {
            await api.post(`/orders/orders/${order.id}/cancel/`);
            setOrderStatus('cancelled');
            showToast("Order cancelled successfully.", "success");
        } catch (error) {
            console.error("Cancel Error:", error.response?.data || error.message);
            showToast(error.response?.data?.error || "Failed to cancel order.", "error");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-[#F5F5F5]'>
            {/* Header with Back Button */}
            <View className='flex-row items-center p-4 bg-white border-b border-gray-200'>
                <TouchableOpacity onPress={() => router.back()} className='p-2 mr-2'>
                    <ArrowLeft color="#8B5A3C" size={24} />
                </TouchableOpacity>
                <Text className='text-xl font-bold text-primary'>Order Details</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className='flex-1 justify-start items-start gap-4'>

                    {/* --- YOUR PASTED CODE STARTS HERE --- */}

                    <View className='flex-col gap-2 p-4 bg-white rounded-xl border justify-center border-secondary-light w-full'>
                        <View>
                            <Text className={`${currentStatus === "rejected" ? 'text-red-400' : currentStatus === "cancelled" ? 'text-red-400' : currentStatus === "unpaid" ? 'text-orange-500' : 'text-secondary-strong'} mx-auto  text-xl font-bold`}>{(currentStatus).toUpperCase()}</Text>
                        </View>
                        {order.reject_reason &&
                            <Text className='text-secondary-strong text-md font-bold'>{order.reject_reason}</Text>
                        }
                    </View>

                    {/* Reference Number Submission for Unpaid Orders */}
                    {currentStatus === 'unpaid' && (
                        <View className='gap-3 p-4 bg-white rounded-xl border border-orange-200 w-full'>
                            <Text className='text-primary font-semibold'>Payment Reference Number</Text>
                            <TextInput
                                value={referenceNumber}
                                onChangeText={handleReferenceNumberChange}
                                placeholder='1234 5678 9012 345'
                                keyboardType='number-pad'
                                maxLength={18}
                                editable={!submittingReference}
                                className='border border-gray-200 rounded-lg px-4 py-3 text-primary bg-white'
                            />
                            <TouchableOpacity
                                onPress={handlePostReferenceNumber}
                                disabled={submittingReference || !isReferenceNumberComplete}
                                className={`flex-row items-center justify-center gap-2 p-4 bg-orange-500 rounded-xl w-full active:opacity-80 ${submittingReference || !isReferenceNumberComplete ? 'opacity-60' : ''}`}
                            >
                                {submittingReference && (
                                    <ActivityIndicator size='small' color='white' />
                                )}
                                <Text className='text-white text-lg font-bold'>
                                    {submittingReference ? 'Submitting...' : 'Submit Reference Number'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStatus === 'unpaid' && (
                        <TouchableOpacity
                            onPress={handleCancel}
                            disabled={cancelling || submittingReference}
                            className='flex-row items-center justify-center gap-2 p-4 bg-red-500 rounded-xl w-full active:opacity-80'
                        >
                            {cancelling ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <XCircle size={20} color="white" />
                            )}
                            <Text className='text-white text-lg font-bold'>
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    <View className='flex-row gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                            <Cake style={{ color: '#A67C52' }} />
                        </View>
                        <View>
                            <Text className='text-gray-300'>Occassion</Text>
                            <Text className='text-primary text-lg font-semibold'>{occasion === "other" ? capitalize(specifyOccasion) : capitalize(occasion)}</Text>
                        </View>
                    </View>

                    <View className='gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='flex-row gap-2 items-center'>
                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                <Cake style={{ color: '#A67C52' }} />
                            </View>
                            <Text className='text-primary text-lg font-semibold'>Cake Specifications</Text>
                        </View>
                        <View className='flex-row flex-wrap justify-between gap-2'>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Shape</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {shape || '-'}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Size</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {tier ? `${tier} Tier` : '-'}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Flavor</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {baseFlavor || '-'}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Filling</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {filling || 'None'}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Coating Color</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {coatingColor || '-'}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Border Design</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {border || 'None'}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Border Color</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {borderColor || 'None'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='flex-row gap-2 items-center'>
                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                <Mail style={{ color: '#A67C52' }} />
                            </View>
                            <Text className='text-primary text-lg font-semibold'>Message</Text>
                        </View>
                        {messageType === "none" ?
                            <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                <Text className='text-secondary-light text-lg font-semibold capitalize'>No message</Text>
                            </View>
                            :
                            <View className='flex-row flex-wrap justify-between gap-2'>
                                <View className='w-[48%] p-4 bg-white rounded-lg'>
                                    <Text className='text-gray-400 text-xs mb-1'>Message Type</Text>
                                    <Text className='text-primary text-lg font-semibold capitalize'>{messageType || 'None'}</Text>
                                </View>
                                <View className='w-[48%] p-4 bg-white rounded-lg'>
                                    <Text className='text-gray-400 text-xs mb-1'>Message</Text>
                                    <Text className='text-primary text-lg font-semibold'>{message || 'None'}</Text>
                                </View>
                            </View>
                        }
                    </View>

                    <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='flex-row gap-2 items-center'>
                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                <CakeIcon style={{ color: '#A67C52' }} />
                            </View>
                            <Text className='text-primary text-lg font-semibold'>Cupcakes</Text>
                        </View>
                        {!hasCupcakes ?
                            <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                <Text className='text-secondary-light text-lg font-semibold capitalize'>No cupcakes</Text>
                            </View>
                            :
                            <View className='flex-row flex-wrap justify-between gap-2'>
                                <View className='w-[48%] p-4 bg-white rounded-lg'>
                                    <Text className='text-gray-400 text-xs mb-1'>Cupcake Count</Text>
                                    <Text className='text-primary text-lg font-semibold capitalize'>{cupcakesCount} x</Text>
                                </View>
                                <View className='w-[48%] p-4 bg-white rounded-lg'>
                                    <Text className='text-gray-400 text-xs mb-1'>Frosting</Text>
                                    <Text className='text-primary text-lg font-semibold'>{cupcakesFrosting || 'None'}</Text>
                                </View>
                            </View>
                        }
                    </View>

                    <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='flex-row gap-2 items-center'>
                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                <NotepadText style={{ color: '#A67C52' }} />
                            </View>
                            <Text className='text-primary text-lg font-semibold'>Additional Information</Text>
                        </View>
                        <View className='w-full p-4 bg-white rounded-lg'>
                            <Text className='text-gray-400 text-xs mb-1'>Comments</Text>
                            {comments.trim().length <= 0 ?
                                <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                    <Text className='text-secondary-light text-lg font-semibold capitalize'>No comments</Text>
                                </View>
                                :
                                <Text className='text-primary text-lg font-semibold capitalize'>{comments}</Text>
                            }
                        </View>

                        <View className='flex-col gap-2 bg-white w-full'>
                            <View className='flex-row gap-2 items-center mb-2'>
                                <View className='bg-gray-100 w-12 h-12 rounded-full items-center justify-center'>
                                    <NotepadText style={{ color: '#A67C52' }} />
                                </View>
                                <Text className='text-primary text-lg font-semibold'>Reference Images</Text>
                            </View>

                            <View className='flex-row flex-wrap gap-2'>
                                {displayImages.length > 0 ? (
                                    displayImages.map((uri, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleImagePress(uri)}
                                            activeOpacity={0.8}
                                        >
                                            <Image
                                                source={{ uri: uri }}
                                                style={{ width: imageSize, height: imageSize, borderRadius: 8 }}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View className='w-full p-4 bg-gray-50 rounded-lg justify-center items-center'>
                                        <Text className='text-gray-400 text-lg font-semibold capitalize'>No images provided</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View className='w-[48%] p-4 bg-white rounded-lg'>
                            <Text className='text-gray-400 text-xs mb-1'>Pickup Date</Text>
                            <Text className='text-primary text-lg font-semibold capitalize'>
                                {dueDate ? new Date(dueDate).toDateString() : 'None'}
                            </Text>
                        </View>
                        <View className='w-[48%] p-4 bg-white rounded-lg'>
                            <Text className='text-gray-400 text-xs mb-1'>Pickup Time</Text>
                            <Text className='text-primary text-lg font-semibold capitalize'>
                                {pickupTime ? parseTimeString(pickupTime) : 'None'}
                            </Text>
                        </View>
                    </View>

                    <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='flex-row gap-2 items-center'>
                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                <NotepadText style={{ color: '#A67C52' }} />
                            </View>
                            <Text className='text-primary text-lg font-semibold'>Contact Information</Text>
                        </View>
                        <View className='flex-row flex-wrap justify-between gap-2'>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Full Name</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>{fullName || '-'}</Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Contact Number</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>{contactNumber || '-'}</Text>
                            </View>
                            <View className='w-full p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Email</Text>
                                <Text className='text-primary text-lg font-semibold'>{email || '-'}</Text>
                            </View>
                            <View className='w-full p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Address</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>{address || '-'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* --- YOUR PASTED CODE ENDS HERE --- */}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderDetails;