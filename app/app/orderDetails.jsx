import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cake, Mail, NotepadText, CakeIcon, ArrowLeft, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { capitalize } from '@/utils/capitalize';
import { parseTimeString } from '@/utils/time';
import { useToast } from '@/context/ToastContext';
import api from '@/api/api';
import ActionConfirmModal from '@/components/organisms/ActionConfirmModal';
import { useEffect, useState } from 'react';

const getReferenceDigits = (value = '') => value.replace(/\D/g, '').slice(0, 15);

const formatReferenceNumber = (value = '') => {
    const digits = getReferenceDigits(value);

    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 12) return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;

    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12)}`;
};

const formatCurrency = (value = 0) => {
    const amount = Number(value || 0);
    return `₱ ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatEnumLabel = (value = '') => {
    const normalized = String(value || '').trim();
    if (!normalized) return '';
    if (normalized.toUpperCase() === 'N/A') return 'N/A';

    return normalized
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const parseOrderDataParam = (orderDataParam) => {
    if (!orderDataParam) return {};

    try {
        return JSON.parse(orderDataParam);
    } catch (e) {
        console.error('Error parsing order data', e);
        return {};
    }
};

const extractDisplayImages = (order = {}) => {
    const orderImages = Array.isArray(order?.order_images) ? order.order_images : [];
    if (orderImages.length > 0) {
        return orderImages.map(img => img.image_url).filter(Boolean);
    }

    return order?.image ? [order.image] : [];
};

const OrderDetails = () => {
    const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const router = useRouter();
    const params = useLocalSearchParams();
    const { showToast } = useToast();
    const orderDataParam = Array.isArray(params.orderData) ? params.orderData[0] : params.orderData;
    const [orderData, setOrderData] = useState(() => parseOrderDataParam(orderDataParam));
    const [referenceNumber, setReferenceNumber] = useState('');
    const [submittingReference, setSubmittingReference] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [requestingCancellation, setRequestingCancellation] = useState(false);
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [pendingCancelAction, setPendingCancelAction] = useState(null);
    const [isEditingOrderDetails, setIsEditingOrderDetails] = useState(false);
    const [editableComments, setEditableComments] = useState('');
    const [editableImages, setEditableImages] = useState([]);
    const [savingOrderDetails, setSavingOrderDetails] = useState(false);
    const [pickingImages, setPickingImages] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null);
    const { width } = Dimensions.get('window');
    const imageSize = (width - 32 - 16) / 3;

    // Use local state so UI updates immediately after cancel
    const currentStatus = orderStatus ?? orderData.status;

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
        refund_reference_number: refundReferenceNumber,
        cancellation_requested: cancellationRequested,
    } = orderData;

    useEffect(() => {
        const parsedOrder = parseOrderDataParam(orderDataParam);
        setOrderData(parsedOrder);
        setOrderStatus(null);
        setEditableComments(parsedOrder?.comments || '');
        setEditableImages(extractDisplayImages(parsedOrder));
        setIsEditingOrderDetails(false);
    }, [orderDataParam]);

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
    const isPremadeOrder = String(occasion || '').toLowerCase() === 'pre-made';
    const canCustomerEditOrderDetails = !isPremadeOrder && ['unpaid', 'pending', 'accepted'].includes(String(currentStatus || '').toLowerCase());
    const payments = orderData?.payments || [];
    const successfulPayments = payments.filter((payment) => {
        const status = String(payment?.status || '').toLowerCase();
        return status === 'success' || status === 'completed' || status === 'paid';
    });
    const totalPaidAmount = successfulPayments.reduce((sum, payment) => sum + Number(payment?.amount || 0), 0);
    const recordedDownpayment = successfulPayments.find((payment) => String(payment?.payment_type || '').toLowerCase() === 'downpayment');

    // Logic for cupcakes (based on your JSX)
    const hasCupcakes = !!orderData.cupcake_orders; // Check your API structure for this
    const cupcakesCount = Number(orderData.cupcake_orders?.amount ?? 0);
    const cupcakesFrosting = orderData.cupcake_orders?.frosting || "";

    const reloadOrderDetails = async () => {
        if (!orderData?.id) return;

        const response = await api.get(`/orders/orders/${orderData.id}/`);
        const freshOrder = response.data;

        setOrderData(freshOrder);
        setOrderStatus(freshOrder?.status ?? null);
        setEditableComments(freshOrder?.comments || '');
        setEditableImages(extractDisplayImages(freshOrder));
        setIsEditingOrderDetails(false);

        if (freshOrder?.reference_number) {
            setReferenceNumber(formatReferenceNumber(freshOrder.reference_number));
        }
    };

    const uploadToCloudinary = async (imageUri) => {
        if (!imageUri) return null;

        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: filename,
            type,
        });
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary Error:', errorData);
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.secure_url;
    };

    const pickEditableImages = async () => {
        if (pickingImages || savingOrderDetails) return;
        if (editableImages.length >= 5) {
            showToast('Maximum 5 images allowed', 'error');
            return;
        }

        setPickingImages(true);
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showToast('Media library permission denied', 'error');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: 5 - editableImages.length,
                quality: 1,
            });

            if (!result.canceled) {
                const newUris = result.assets.map((asset) => asset.uri);
                setEditableImages((prev) => [...prev, ...newUris].slice(0, 5));
            }
        } finally {
            setPickingImages(false);
        }
    };

    const removeEditableImage = (indexToRemove) => {
        setEditableImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveCustomerOrderDetails = async () => {
        if (savingOrderDetails) return;

        setSavingOrderDetails(true);
        try {
            const uploadedImageUrls = await Promise.all(
                editableImages.map(async (uri) => {
                    if (String(uri).startsWith('http://') || String(uri).startsWith('https://')) {
                        return uri;
                    }
                    return uploadToCloudinary(uri);
                })
            );

            await api.patch(`/orders/orders/${orderData.id}/customer-update-details/`, {
                comments: editableComments,
                uploaded_images: uploadedImageUrls,
            });

            await reloadOrderDetails();
            showToast('Order details updated successfully.', 'success');
        } catch (error) {
            console.error('Update Order Details Error:', error.response?.data || error.message);
            showToast(error.response?.data?.error || 'Failed to update order details.', 'error');
        } finally {
            setSavingOrderDetails(false);
        }
    };

    const handleCancelOrderDetailsEdit = () => {
        setEditableComments(orderData?.comments || '');
        setEditableImages(extractDisplayImages(orderData));
        setIsEditingOrderDetails(false);
    };

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
    const displayedReferenceNumber = existingReferenceNumber
        ? formatReferenceNumber(existingReferenceNumber)
        : 'No reference number yet';
    const displayedRefundReferenceNumber = refundReferenceNumber
        ? formatReferenceNumber(refundReferenceNumber)
        : 'No refund reference number yet';
    const totalAmount = Number(orderData?.total_price || 0);
    const expectedDownpayment = isPremadeOrder ? totalAmount * 0.15 : 500;
    const boundedDownpayment = totalAmount > 0
        ? Math.min(expectedDownpayment, totalAmount)
        : expectedDownpayment;
    const paidDownpaymentAmount = recordedDownpayment
        ? Number(recordedDownpayment.amount || 0)
        : Math.min(totalPaidAmount, boundedDownpayment);
    const displayDownpaymentAmount = totalPaidAmount > 0 ? paidDownpaymentAmount : boundedDownpayment;
    const downpaymentAmountDisplay = formatCurrency(displayDownpaymentAmount);
    const showTotalAmount = isPremadeOrder || totalAmount > 0;
    const totalAmountDisplay = totalAmount > 0
        ? formatCurrency(totalAmount)
        : (isPremadeOrder ? 'N/A' : 'Available after order is completed');

    const handlePostReferenceNumber = async () => {
        if (submittingReference) return;

        const normalizedReference = getReferenceDigits(referenceNumber);
        if (normalizedReference.length < 13 || normalizedReference.length > 15) {
            showToast('Reference number must be 13 to 15 digits', 'error');
            return;
        }

        setSubmittingReference(true);
        try {
            await api.patch(`/orders/orders/${orderData.id}/`, {
                reference_number: normalizedReference,
                status: 'pending',
            });

            await reloadOrderDetails();
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
            await api.post(`/orders/orders/${orderData.id}/cancel/`);
            setOrderStatus('cancelled');
            showToast("Order cancelled successfully.", "success");
        } catch (error) {
            console.error("Cancel Error:", error.response?.data || error.message);
            showToast(error.response?.data?.error || "Failed to cancel order.", "error");
        } finally {
            setCancelling(false);
        }
    };

    const handleRequestCancellation = async () => {
        if (requestingCancellation) return;

        setRequestingCancellation(true);
        try {
            await api.post(`/orders/orders/${orderData.id}/request-cancellation/`);
            await reloadOrderDetails();
            showToast('Cancellation request submitted. Please wait for admin refund processing.', 'success');
        } catch (error) {
            console.error('Cancellation Request Error:', error.response?.data || error.message);
            showToast(error.response?.data?.error || 'Failed to submit cancellation request.', 'error');
        } finally {
            setRequestingCancellation(false);
        }
    };

    const openCancelConfirmation = (actionType = 'cancel') => {
        if (cancelling || requestingCancellation) return;
        setPendingCancelAction(actionType);
        setShowCancelConfirmModal(true);
    };

    const closeCancelConfirmation = () => {
        if (cancelling || requestingCancellation) return;
        setShowCancelConfirmModal(false);
        setPendingCancelAction(null);
    };

    const confirmCancelAction = async () => {
        if (!pendingCancelAction) return;

        if (pendingCancelAction === 'request') {
            await handleRequestCancellation();
        } else {
            await handleCancel();
        }

        setShowCancelConfirmModal(false);
        setPendingCancelAction(null);
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
                            <Text className={`${currentStatus === "rejected" ? 'text-red-400' : currentStatus === "cancelled" ? 'text-red-400' : currentStatus === "refunded" ? 'text-red-400' : currentStatus === "unpaid" ? 'text-orange-500' : 'text-secondary-strong'} mx-auto  text-xl font-bold`}>{(currentStatus).toUpperCase()}</Text>
                        </View>
                        {orderData.reject_reason &&
                            <Text className='text-secondary-strong text-md font-bold'>{orderData.reject_reason}</Text>
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
                            onPress={() => openCancelConfirmation('cancel')}
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

                    {(currentStatus === 'pending' || currentStatus === 'accepted') && !cancellationRequested && (
                        <TouchableOpacity
                            onPress={() => openCancelConfirmation('request')}
                            disabled={requestingCancellation}
                            className={`flex-row items-center justify-center gap-2 p-4 bg-red-500 rounded-xl w-full active:opacity-80 ${requestingCancellation ? 'opacity-60' : ''}`}
                        >
                            {requestingCancellation ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <XCircle size={20} color="white" />
                            )}
                            <Text className='text-white text-lg font-bold'>
                                {requestingCancellation ? 'Submitting Request...' : 'Request Cancellation'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {(currentStatus === 'pending' || currentStatus === 'accepted') && cancellationRequested && (
                        <View className='gap-1 p-4 bg-red-50 rounded-xl border border-red-200 w-full'>
                            <Text className='text-red-600 font-semibold'>Cancellation Requested</Text>
                            <Text className='text-red-500 text-sm'>Waiting for admin refund and cancellation confirmation.</Text>
                        </View>
                    )}

                    <View className='flex-row gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                            <NotepadText style={{ color: '#A67C52' }} />
                        </View>
                        <View>
                            <Text className='text-gray-300'>Payment Reference Number</Text>
                            <Text className='text-primary text-lg font-semibold'>{displayedReferenceNumber}</Text>
                        </View>
                    </View>

                    {((currentStatus === 'cancelled' || currentStatus === 'refunded') && (refundReferenceNumber || existingReferenceNumber)) && (
                        <View className='flex-row gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                <NotepadText style={{ color: '#A67C52' }} />
                            </View>
                            <View>
                                <Text className='text-gray-300'>Refund Reference Number</Text>
                                <Text className='text-primary text-lg font-semibold'>{displayedRefundReferenceNumber}</Text>
                            </View>
                        </View>
                    )}

                    <View className='flex-row gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                        <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                            <NotepadText style={{ color: '#A67C52' }} />
                        </View>
                        <View className='flex-1'>
                            <Text className='text-gray-300'>Downpayment Amount</Text>
                            <Text className='text-primary text-lg font-semibold'>{downpaymentAmountDisplay}</Text>
                        </View>
                    </View>

                    {showTotalAmount && (
                        <View className='flex-row gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                <NotepadText style={{ color: '#A67C52' }} />
                            </View>
                            <View className='flex-1'>
                                <Text className='text-gray-300'>Total Amount</Text>
                                <Text className='text-primary text-lg font-semibold'>{totalAmountDisplay}</Text>
                            </View>
                        </View>
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
                                    {isPremadeOrder ? 'N/A' : (tier ? `${tier} Tier` : '-')}
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
                                    {isPremadeOrder ? 'N/A' : (coatingColor || '-')}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Border Design</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {isPremadeOrder ? 'N/A' : (border || 'None')}
                                </Text>
                            </View>
                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                <Text className='text-gray-400 text-xs mb-1'>Border Color</Text>
                                <Text className='text-primary text-lg font-semibold capitalize'>
                                    {isPremadeOrder ? 'N/A' : (borderColor || 'None')}
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
                                    <Text className='text-primary text-lg font-semibold'>{formatEnumLabel(messageType) || 'None'}</Text>
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
                                    <Text className='text-primary text-lg font-semibold'>{cupcakesCount} x</Text>
                                </View>
                                <View className='w-[48%] p-4 bg-white rounded-lg'>
                                    <Text className='text-gray-400 text-xs mb-1'>Frosting</Text>
                                    <Text className='text-primary text-lg font-semibold'>{formatEnumLabel(cupcakesFrosting) || 'None'}</Text>
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

                        {canCustomerEditOrderDetails && (
                            <View className='gap-2 p-3 border border-[#E8D9C8] rounded-xl bg-[#FDF8F3]'>
                                {!isEditingOrderDetails ? (
                                    <TouchableOpacity
                                        onPress={() => setIsEditingOrderDetails(true)}
                                        className='items-center justify-center p-3 bg-[#8B5A3C] rounded-lg'
                                    >
                                        <Text className='text-white font-semibold'>Edit Comments & Images</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className='gap-3'>
                                        <Text className='text-[#8B5A3C] font-semibold'>Update Order Details</Text>

                                        <TextInput
                                            value={editableComments}
                                            onChangeText={setEditableComments}
                                            multiline
                                            numberOfLines={4}
                                            placeholder='Update your order comments'
                                            editable={!savingOrderDetails}
                                            className='border border-gray-200 rounded-lg px-4 py-3 text-primary bg-white'
                                            style={{ minHeight: 100, textAlignVertical: 'top' }}
                                        />

                                        <View className='gap-2'>
                                            <Text className='text-[#8B5A3C] font-semibold'>Reference Images</Text>
                                            <TouchableOpacity
                                                onPress={pickEditableImages}
                                                disabled={savingOrderDetails || pickingImages || editableImages.length >= 5}
                                                className={`items-center justify-center p-3 bg-[#A67C52] rounded-lg ${(savingOrderDetails || pickingImages || editableImages.length >= 5) ? 'opacity-60' : ''}`}
                                            >
                                                <Text className='text-white font-semibold'>
                                                    {pickingImages ? 'Picking Images...' : `Add Images (${editableImages.length}/5)`}
                                                </Text>
                                            </TouchableOpacity>

                                            <View className='flex-row flex-wrap gap-2'>
                                                {editableImages.length > 0 ? (
                                                    editableImages.map((uri, index) => (
                                                        <View key={`${uri}-${index}`} className='relative'>
                                                            <Image
                                                                source={{ uri }}
                                                                style={{ width: imageSize, height: imageSize, borderRadius: 8 }}
                                                                resizeMode='cover'
                                                            />
                                                            <TouchableOpacity
                                                                onPress={() => removeEditableImage(index)}
                                                                disabled={savingOrderDetails}
                                                                className='absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 items-center justify-center'
                                                            >
                                                                <Text className='text-white text-xs font-bold'>X</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))
                                                ) : (
                                                    <View className='w-full p-4 bg-gray-50 rounded-lg justify-center items-center'>
                                                        <Text className='text-gray-400 text-sm font-semibold'>No images selected</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        <View className='flex-row gap-2'>
                                            <TouchableOpacity
                                                onPress={handleCancelOrderDetailsEdit}
                                                disabled={savingOrderDetails}
                                                className='flex-1 items-center justify-center p-3 border border-gray-300 rounded-lg bg-white'
                                            >
                                                <Text className='text-gray-700 font-semibold'>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={handleSaveCustomerOrderDetails}
                                                disabled={savingOrderDetails}
                                                className={`flex-1 items-center justify-center p-3 rounded-lg bg-[#8B5A3C] ${savingOrderDetails ? 'opacity-60' : ''}`}
                                            >
                                                <Text className='text-white font-semibold'>
                                                    {savingOrderDetails ? 'Saving...' : 'Save Updates'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

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

            <ActionConfirmModal
                visible={showCancelConfirmModal}
                title={pendingCancelAction === 'request' ? 'Confirm Cancellation Request' : 'Confirm Cancellation'}
                message='Are you sure you want to cancel this order? This cannot be undone.'
                cancelText='No, Keep Order'
                confirmText={pendingCancelAction === 'request' ? 'Yes, Request Cancellation' : 'Yes, Cancel Order'}
                onCancel={closeCancelConfirmation}
                onConfirm={confirmCancelAction}
                loading={cancelling || requestingCancellation}
                destructive
            />
        </SafeAreaView>
    );
};

export default OrderDetails;