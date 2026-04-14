import './global.css';
import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Animated, Modal } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { X, ArrowLeft, ArrowRight, Check, Cake, MessageCircle, MessageSquare, Mail, CakeIcon, NotepadText, WalletCards, Link2 } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import { CAKE_ASSETS as cakeImages } from './cakeImages';
import { locationStore } from '@/utils/locationStore';
import {
    AddonPage,
    CakeDetailPage,
    CoatingPage,
    CommentPage,
    CupcakePage,
    FlavorPage,
    FormPage,
    ImagePage,
    MessagePage,
    InformationPage,
} from '@/components/molecules/FormPages';
import { useToast } from '@/context/ToastContext';
import useOrder from '@/hooks/useOrder';
import { AuthContext } from '@/context/AuthContext';
import api from '@/api/api';
import { formatPhoneNumber, isValidEmail, isValidPHPhoneNumber } from '@/utils/validators';
import { extractApiErrorMessage } from '@/utils/apiErrors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomOrders = () => {
    const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME

    const { user, loading: userLoading } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const { loading, error, postOrder } = useOrder();
    const [customLayers, setCustomLayers] = useState([]);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(11);
    const [personallyDesign, setPersonallyDesign] = useState(false);
    const [occasion, setOccasion] = useState();
    const [specifyOccasion, setSpecifyOccasion] = useState();
    const [shape, setShape] = useState();
    const [specifyShape, setSpecifyShape] = useState();
    const [tier, setTier] = useState();
    const [baseFlavor, setBaseFlavor] = useState();
    const [filling, setFilling] = useState();
    const [coatingColor, setCoatingColor] = useState();
    const [border, setBorder] = useState();
    const [borderColor, setBorderColor] = useState();
    const [toppings, setToppings] = useState();
    const [addOn, setAddOn] = useState();
    const [messageType, setMessageType] = useState("");
    const [message, setMessage] = useState();
    const [hasCupcakes, setHasCupcakes] = useState(false);
    const [cupcakesCount, setCupcakesCount] = useState();
    const [cupcakesFrosting, setCupcakesFrosting] = useState(null);
    const [comments, setComments] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [pickupTime, setPickupTime] = useState(null);
    const [images, setImages] = useState([]);
    const [fullName, setFullName] = useState(`${user?.first_name || ''} ${user?.last_name || ''}`);
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [contactNumber, setContactNumber] = useState(formatPhoneNumber(user?.phone_number || ''));
    const [agreeToTOC, setAgreeToTOC] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    // Ref to capture the cake preview as a single image
    const cakePreviewRef = useRef();
    const previewScaleX = useRef(new Animated.Value(1)).current;
    const previewScaleY = useRef(new Animated.Value(1)).current;

    const pageTitles = [
        'Cake Details',
        'Form',
        'Flavors',
        'Coating',
        'Add-ons',
        'Message',
        'Cupcakes',
        'Comments',
        'Image',
        'Information',
        'Confirm'
    ]


    const getFillingKey = (fillingValue, shape, tier) => {
        if (fillingValue === 'strawberry' && shape === 'round' && tier > 1) {
            return 'strawberry';
        } else if (fillingValue === 'strawberry' && shape === 'round' && tier === 1) {
            return 'straw';
        } else if (fillingValue === 'strawberry') {
            return 'straw'; 
        }
        return fillingValue; 
    };

    useFocusEffect(
        useCallback(() => {
            const addr = locationStore.consumeAddress();
            if (addr) {
                setAddress(addr);
            }
        }, [])
    );

    useEffect(() => {
        if (tier && !filling) {
            setFilling('vanilla');
        }
    }, [tier]);

    useEffect(() => {
        if (user?.phone_number && !String(contactNumber || '').trim()) {
            setContactNumber(formatPhoneNumber(String(user.phone_number)));
        }
    }, [user?.phone_number, contactNumber]);

    useEffect(() => {
        if (!shape || !tier || shape === 'other') {
            setCustomLayers([]);
            return;
        }

        const assets = cakeImages[shape];
        if (!assets) {
            setCustomLayers([]);
            return;
        }

        const tierKey = `tier${tier}`; 
        let newLayers = [];

        if (page === 2 || page === 3) {
            const baseKey = baseFlavor || 'yellow';
            const base = assets.bases?.[tierKey]?.[baseKey];
            if (base) newLayers.push(base);

            if (page === 3 && filling) {
                const fillKey = getFillingKey(filling, shape, tier);
                const fill = assets.fillings?.[tierKey]?.[fillKey];
                if (fill) newLayers.push(fill);
            }

        } else if (page >= 4) {
            const activeCoating = coatingColor || 'yellow';
            const base = assets.bases?.[tierKey]?.[activeCoating];
            if (base) newLayers.push(base);

            if (border && borderColor) {
                if (border === 'piping' && assets.pipings?.[tierKey]?.[borderColor]) {
                    newLayers.push(assets.pipings[tierKey][borderColor]);
                } else if (border === 'drip' && assets.drips?.[tierKey]?.[borderColor]) {
                    newLayers.push(assets.drips[tierKey][borderColor]);
                }
            }

            if (page >= 5 && toppings === 'sprinkles') {
                const sprinkleVariant = border === 'drip' ? 'drip' : 'pipe';
                const sprinkle = assets.sprinkles?.[sprinkleVariant]?.[tierKey];
                if (sprinkle) newLayers.push(sprinkle);
            }

            if (page >= 5 && addOn === 'candle') {
                const accessoryShapeKey = shape === 'sheet' ? 'sheet' : 'round';
                const candle = cakeImages.accessories?.[accessoryShapeKey]?.[tierKey];
                if (candle) newLayers.push(candle);
            }
        }

        setCustomLayers(newLayers);
    }, [page, shape, tier, baseFlavor, filling, coatingColor, border, borderColor, toppings, addOn]);

    useEffect(() => {
        if (personallyDesign || shape === 'other' || customLayers.length === 0) {
            return;
        }

        Animated.sequence([
            Animated.parallel([
                Animated.timing(previewScaleX, {
                    toValue: 1.07,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(previewScaleY, {
                    toValue: 0.93,
                    duration: 120,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(previewScaleX, {
                    toValue: 1,
                    speed: 14,
                    bounciness: 9,
                    useNativeDriver: true,
                }),
                Animated.spring(previewScaleY, {
                    toValue: 1,
                    speed: 14,
                    bounciness: 9,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [customLayers, personallyDesign, shape, previewScaleX, previewScaleY]);



    if (!user) {
        router.replace('/(auth)/login');
    }

    if (loading || userLoading || isSubmitting) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#8B5A3C" />
                {isSubmitting && <Text className="text-secondary-light mt-2">Processing Order...</Text>}
            </View>
        );
    }

    const startPayMongoCheckout = async (orderId) => {
        const response = await api.post('/payment/initiate/', { order_id: orderId });
        const checkoutUrl = response?.data?.checkout_url;

        if (!checkoutUrl) {
            throw new Error('Checkout URL was not returned by PayMongo initiate endpoint.');
        }

        router.replace({
            pathname: '/paymentScreen',
            params: {
                checkoutUrl,
                orderId,
            },
        });
    };

    const orderCake = async (paymentMethod = 'reference_number') => {
        let capturedCakeUri = null;
        if (!personallyDesign && customLayers.length > 0 && cakePreviewRef.current) {
            try {
                capturedCakeUri = await captureRef(cakePreviewRef, {
                    format: 'png',
                    quality: 1,
                });
            } catch (captureErr) {
                console.warn('Could not capture cake preview:', captureErr);
            }
        }

        setIsSubmitting(true); 
        let newOrderId = null;

        try {
            let uploadedImageUrls = [];

            let imagesToUpload = [...images];

            if (capturedCakeUri) {
                imagesToUpload.unshift(capturedCakeUri);
            }

            if (imagesToUpload.length > 0) {
                const uploadPromises = imagesToUpload.map(uri => uploadToCloudinary(uri));
                uploadedImageUrls = await Promise.all(uploadPromises);
            }

            const cakeData = personallyDesign ? {
                occasion: occasion === "other" ? specifyOccasion : occasion,
                shape: "Custom Request",
                cake_tier: 1,
                base_flavor: "See Comments",
                filling: "See Comments",
                coating_color: "See Reference",
                border: "See Reference",
                border_color: "See Reference",
                toppings: "See Reference",
                addons: "See Reference",
                message_type: "none",
                message: "",
            } : {
                occasion: occasion === "other" ? specifyOccasion : occasion,
                shape: shape === "other" ? specifyShape : shape,
                cake_tier: tier,
                base_flavor: baseFlavor,
                filling: filling,
                coating_color: coatingColor ? coatingColor : "None",
                border: border ? border : "None",
                border_color: borderColor ? borderColor : "None",
                toppings: toppings,
                addons: addOn,
                message_type: messageType,
                message: messageType === "none" ? "" : message,
            };

            const formattedDate = dueDate instanceof Date ? dueDate.toISOString().split('T')[0] : dueDate;
            const formattedTime = pickupTime instanceof Date ? pickupTime.toTimeString().split(' ')[0] : pickupTime;

            const payload = {
                full_name: fullName,
                email: email,
                phone_number: contactNumber,
                address: address,
                due_date: formattedDate,
                pickup_time: formattedTime,
                cake_orders: cakeData,
                ...((hasCupcakes && !personallyDesign) && {
                    cupcake_orders: {
                        amount: cupcakesCount,
                        frosting: cupcakesFrosting,
                    }
                }),
                comments: comments,
                image: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null,
                uploaded_images: uploadedImageUrls,
                payment_method: paymentMethod,
            };

            const response = await postOrder(payload);

            newOrderId = response?.id || response?.data?.id;

            if (paymentMethod === 'paymongo') {
                if (!newOrderId) {
                    throw new Error('Order ID missing after order creation.');
                }

                await startPayMongoCheckout(newOrderId);
            } else {
                if (newOrderId) {
                    router.replace({
                        pathname: '/gcashInformation',
                        params: {
                            amount: '500.00',
                            paymentType: 'custom',
                            orderId: newOrderId,
                        },
                    });
                } else {
                    showToast('Order placed, but ID missing. Check Order History.');
                    router.push('/orderSuccess');
                }
            }

        } catch (err) {
            console.error(err);
            const orderErrorMessage = extractApiErrorMessage(err, 'Failed to place order. Please try again.');

            if (paymentMethod === 'paymongo' && newOrderId) {
                showToast('Order placed, but PayMongo checkout failed. You can retry from Orders.', 'error');
                router.replace('/(tabs)/orders');
            } else {
                showToast(orderErrorMessage, 'error');
            }
        } finally {
            setIsSubmitting(false); 
        }
    };

    const openPaymentMethodModal = () => {
        if (!validateCurrentPage()) return;
        setShowPaymentMethodModal(true);
    };

    const handleSelectPaymentMethod = (paymentMethod) => {
        if (isSubmitting) return;
        setSelectedPaymentMethod(paymentMethod);
        setShowPaymentMethodModal(false);
        setShowPaymentConfirmationModal(true);
    };

    const handleCancelPaymentConfirmation = () => {
        if (isSubmitting) return;
        setShowPaymentConfirmationModal(false);
        setShowPaymentMethodModal(true);
    };

    const confirmSelectedPaymentMethod = async () => {
        if (isSubmitting || !selectedPaymentMethod) return;
        setShowPaymentConfirmationModal(false);
        await orderCake(selectedPaymentMethod);
    };

    const validateCurrentPage = () => {
        switch (page) {
            case 1: // Cake Details
                if (!occasion) {
                    showToast("Please select an occasion", 'error');
                    return false;
                } else if (occasion === "other" && !specifyOccasion) {
                    showToast("Please enter your special occasion", 'error');
                    return false;
                }

                if (!border) {
                    showToast("Please select a border style", 'error');
                    return false;
                }
                if (!borderColor) {
                    showToast("Please select a border color", 'error');
                    return false;
                }
                return true;

            case 2: // Form (Shape & Tier)
                if (!shape) {
                    showToast("Please select a cake shape", 'error');
                    return false;
                } else if (shape === "other" && !specifyShape) {
                    showToast("Please specify your cake shape", 'error');
                    return false;
                }
                if (!tier) {
                    showToast("Please select a cake tier", 'error');
                    return false;
                }
                return true;

            case 3: // Flavors
                if (!baseFlavor) {
                    showToast("Please select a base flavor", 'error');
                    return false;
                }
                if (!filling) {
                    showToast("Please select a filling", 'error');
                    return false;
                }
                return true;

            case 4: // Coating
                if (!coatingColor) {
                    showToast("Please select a coating color", 'error');
                    return false;
                }
                if (!border) {
                    showToast("Please select a border style", 'error');
                    return false;
                }
                if (!borderColor) {
                    showToast("Please select a border color", 'error');
                    return false;
                }
                return true;

            case 5: // Add-ons
                if (!toppings) {
                    showToast("Please select a toppings option", 'error');
                    return false;
                }
                if (!addOn) {
                    showToast("Please select an add-on option", 'error');
                    return false;
                }
                return true;

            case 6: // Message
                if (messageType === "") {
                    showToast("Please select a message type", 'error');
                    return false;
                }
                if (messageType !== "none" && (!message || message.trim() === "")) {
                    showToast("Please enter your message", 'error');
                    return false;
                }
                return true;

            case 7: // Cupcakes
                if (hasCupcakes) {
                    if (!cupcakesCount || parseInt(cupcakesCount) <= 0) {
                        showToast("Please enter the number of cupcakes", 'error');
                        return false;
                    }
                    if (!cupcakesFrosting) {
                        showToast("Please select a cupcake frosting", 'error');
                        return false;
                    }
                }
                return true;

            case 8: // Comments + Due Date
                if (!dueDate) {
                    showToast("Please select a pickup date for your order", 'error');
                    return false;
                }
                if (!pickupTime) {
                    showToast("Please select a pickup time for your order", 'error');
                    return false;
                }
                if (personallyDesign && (!comments || comments.trim() === "")) {
                    showToast("Please describe your custom design in the comments", 'error');
                    return false;
                }
                return true;

            case 9: // Image
                if (personallyDesign && images.length === 0) {
                    showToast("Please upload a reference image for your custom design", 'error');
                    return false;
                }
                return true;

            case 10: // Information
                if (!fullName.trim()) {
                    showToast("Please enter your full name", 'error');
                    return false;
                }

                if (!contactNumber.trim()) {
                    showToast("Please enter your contact number", 'error');
                    return false;
                } else if (!isValidPHPhoneNumber(contactNumber)) {
                    showToast("Number must be valid", 'error');
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

                if (!agreeToTOC) {
                    showToast("You must agree to the Terms and Conditions to proceed", 'error');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const handleChangePage = (direction) => {
        if (direction === 'next' && page < maxPage) {
            if (validateCurrentPage()) {
                if (personallyDesign && page === 1) {
                    setPage(8);
                }
                else {
                    setPage(page + 1);
                }
            }
        } else if (direction === 'prev' && page > 1) {
            if (personallyDesign && page === 8) {
                setPage(1);
            } else {
                setPage(page - 1);
            }
        }
    }

    const toggleHasCupcakes = () => {
        setHasCupcakes(!hasCupcakes);
    }

    const pickImage = async () => {
        if (images.length >= 5) {
            showToast("Maximum 6 images allowed", "error");
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission denied!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - images.length, 
            quality: 1,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setImages([...images, ...newUris]);
        }
    };

    const uploadToCloudinary = async (imageUri) => {
        if (!imageUri) return null;

        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();

        formData.append("file", {
            uri: imageUri,
            name: filename,
            type: type,
        });

        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Cloudinary Error:", errorData);
                throw new Error("Failed to upload image");
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw error;
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const capitalize = (str) => {
        if (!str) return '';
        return str[0].toUpperCase() + str.slice(1)
    }

    const handleContactNumber = (text) => {
        const formatted = formatPhoneNumber(text);
        setContactNumber(formatted);
    };

    // const handlePayViaGCash = async (orderId) => {
    //     try {
    //         showToast("Initiating GCash payment...", "info");

    //         const payload = { order_id: orderId };

    //         // Call Backend to get Checkout URL
    //         const response = await api.post(`/payment/initiate/`, payload);
    //         const { checkout_url } = response.data;

    //         if (checkout_url) {
    //             // Navigate to PaymentScreen using Expo Router
    //             // Make sure your PaymentScreen file is named 'PaymentScreen.js' inside your app folder 
    //             // or adjust the pathname accordingly (e.g., '/payment')
    //             router.push({
    //                 pathname: '/paymentScreen',
    //                 params: {
    //                     checkoutUrl: checkout_url,
    //                     orderId: orderId
    //                 }
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Payment Error:", error.response?.data || error.message);
    //         showToast("Error initiating payment. You can retry from your orders.", "error");
    //         router.replace('/(tabs)/orders');
    //     }
    // };

    function formatText(str) {
        return str
            .split('_')                 
            .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' ');               
    }

    const customDownpaymentAmount = 500;
    const selectedPaymentMethodLabel = selectedPaymentMethod === 'paymongo' ? 'PayMongo Checkout' : 'Reference Number';


    return (
        <SafeAreaView className='flex-1 bg-[#8B5A3C]'>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    className="flex-1"
  
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ height: SCREEN_HEIGHT * 0.35 }} className="w-full items-center justify-center p-4">
                        <View className='aspect-square h-[90%] border-8 border-white rounded-[40px] justify-center items-center shadow-sm relative'>
                            <View className='absolute h-4 w-4/5 bg-white rounded-2xl -z-10 bottom-8'></View>
                            <View className='absolute h-2 w-4/5 bg-white/20 rounded-2xl -z-10 bottom-14'></View>
                            <View className='absolute h-4 w-4/5 bg-white rounded-2xl -z-10 top-8'></View>
                            {personallyDesign ? (
                                <View className="items-center">
                                    <Text className='text-sm font-semibold text-gray-300'>CUSTOM DESIGN</Text>
                                    <Text className='text-xs text-gray-400'>Please upload reference on Page 9</Text>
                                </View>
                            ) : (
                                shape === "other" ? (
                                    <Text className='text-sm font-semibold text-gray-300'>NO PREVIEW</Text>
                                ) : customLayers.length > 0 ? (
                                    <Animated.View style={{ transform: [{ scaleX: previewScaleX }, { scaleY: previewScaleY }] }}>
                                        <View ref={cakePreviewRef} collapsable={false} style={{ width: 300, height: 300 }}>
                                            {customLayers.map((layerSource, index) => (
                                                <Image
                                                    key={index}
                                                    source={layerSource}
                                                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                                                    resizeMode="contain"
                                                />
                                            ))}
                                        </View>
                                    </Animated.View>
                                ) : (
                                    <Text className='text-sm font-semibold text-gray-300'>CAKE PREVIEW</Text>
                                )
                            )}
                            
                        </View>
                    </View>

                    <View className='bg-main-form w-full flex-1 rounded-t-[3rem] px-6 pb-8'>
                        {/* Header */}
                        <View className='w-full flex-row justify-between items-center mt-8 mb-6'>
                            <View>
                                <Text className='text-2xl font-semibold text-[#8B5A3C]'>{pageTitles[page - 1]}</Text>
                                <Text className='text-[#9A8978]'>{page === 11 ? 'Check and confirm your cake' : 'Customize your perfect cake'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.back()}><X style={{ color: '#8B5A3C' }} /></TouchableOpacity>
                        </View>

                        <View className='min-h-[200px]'>
                            {page === 1 && (
                                <CakeDetailPage
                                    occasion={occasion} setOccasion={setOccasion}
                                    specifyOccasion={specifyOccasion} setSpecifyOccasion={setSpecifyOccasion}
                                    personallyDesign={personallyDesign} setPersonallyDesign={setPersonallyDesign}
                                />
                            )}
                            {page === 2 && (
                                <FormPage
                                    shape={shape} setShape={setShape}
                                    specifyShape={specifyShape} setSpecifyShape={setSpecifyShape}
                                    tier={tier} setTier={setTier}
                                />
                            )}
                            {page === 3 && (
                                <FlavorPage
                                    baseFlavor={baseFlavor} setBaseFlavor={setBaseFlavor}
                                    filling={filling} setFilling={setFilling}
                                />
                            )}
                            {page === 4 && (
                                <CoatingPage
                                    coatingColor={coatingColor} setCoatingColor={setCoatingColor}
                                    border={border} setBorder={setBorder}
                                    borderColor={borderColor} setBorderColor={setBorderColor}
                                />
                            )}
                            {page === 5 && (
                                <AddonPage
                                    toppings={toppings} setToppings={setToppings}
                                    addOn={addOn} setAddOn={setAddOn}
                                />
                            )}
                            {page === 6 && (
                                <MessagePage
                                    messageType={messageType} setMessageType={setMessageType}
                                    message={message} setMessage={setMessage}
                                />
                            )}
                            {page === 7 && (
                                <CupcakePage
                                    hasCupcakes={hasCupcakes} toggleHasCupcakes={toggleHasCupcakes}
                                    cupcakesCount={cupcakesCount} setCupcakesCount={setCupcakesCount}
                                    cupcakesFrosting={cupcakesFrosting} setCupcakesFrosting={setCupcakesFrosting}
                                />
                            )}
                            {page === 8 && (
                                <CommentPage
                                    comments={comments} setComments={setComments}
                                    dueDate={dueDate} setDueDate={setDueDate}
                                    pickupTime={pickupTime} setPickupTime={setPickupTime}
                                />
                            )}
                            {page === 9 && (
                                <ImagePage
                                    images={images}          // Pass the array
                                    pickImage={pickImage}    // Pass the picker function
                                    removeImage={removeImage} // Pass the remover function
                                />
                            )}
                            {page === 10 && (
                                <InformationPage
                                    fullName={fullName} setFullName={setFullName}
                                    address={address} setAddress={setAddress}
                                    email={email} setEmail={setEmail}
                                    contactNumber={contactNumber} setContactNumber={handleContactNumber}
                                    agreeToTOC={agreeToTOC} setAgreeToTOC={setAgreeToTOC}
                                />
                            )}
                            {page === 11 && (
                                <View className='flex-1 justify-start items-start gap-4'>
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
                                                    {tier ? `${tier} Tier` : 'None'}
                                                </Text>
                                            </View>
                                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                <Text className='text-gray-400 text-xs mb-1'>Flavor</Text>
                                                <Text className='text-primary text-lg font-semibold capitalize'>
                                                    {baseFlavor || 'None'}
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
                                                    {coatingColor || 'None'}
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
                                    <View className='flex-1 justify-start items-start gap-4 w-full'>
                                        <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                                            <View className='flex-row gap-2 items-center'>
                                                <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                                    <Mail style={{ color: '#A67C52' }} />
                                                </View>
                                                <Text className='text-primary text-lg font-semibold'>Message</Text>
                                            </View>
                                            {messageType === "none" ?
                                                <>
                                                    <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                                        <Text className='text-secondary-light text-lg font-semibold capitalize'>
                                                            No message
                                                        </Text>
                                                    </View>
                                                </>
                                                :
                                                <View className='flex-row flex-wrap justify-between gap-2'>
                                                    <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                        <Text className='text-gray-400 text-xs mb-1'>Message Type</Text>
                                                        <Text className='text-primary text-lg font-semibold capitalize'>
                                                            {formatText(messageType) || 'None'}
                                                        </Text>
                                                    </View>
                                                    <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                        <Text className='text-gray-400 text-xs mb-1'>Message</Text>
                                                        <Text className='text-primary text-lg font-semibold'>
                                                            {message || 'None'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            }
                                        </View>
                                    </View>
                                    <View className='flex-1 justify-start items-start gap-4 w-full'>
                                        <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                                            <View className='flex-row gap-2 items-center'>
                                                <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                                    <CakeIcon style={{ color: '#A67C52' }} />
                                                </View>
                                                <Text className='text-primary text-lg font-semibold'>Cupcakes</Text>
                                            </View>
                                            {!hasCupcakes ?
                                                <>
                                                    <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                                        <Text className='text-secondary-light text-lg font-semibold capitalize'>
                                                            No cupcakes
                                                        </Text>
                                                    </View>
                                                </>
                                                :
                                                <View className='flex-row flex-wrap justify-between gap-2'>
                                                    <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                        <Text className='text-gray-400 text-xs mb-1'>Cupcake Count</Text>
                                                        <Text className='text-primary text-lg font-semibold capitalize'>
                                                            {cupcakesCount} x
                                                        </Text>
                                                    </View>
                                                    <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                        <Text className='text-gray-400 text-xs mb-1'>Frosting</Text>
                                                        <Text className='text-primary text-lg font-semibold capitalize'>
                                                            {cupcakesFrosting || 'None'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            }
                                        </View>
                                    </View>
                                    <View className='flex-1 justify-start items-start gap-4  w-full'>
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
                                                    <>
                                                        <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                                            <Text className='text-secondary-light text-lg font-semibold capitalize'>
                                                                No comments
                                                            </Text>
                                                        </View>
                                                    </>
                                                    :
                                                    <Text className='text-primary text-lg font-semibold capitalize'>
                                                        {comments}
                                                    </Text>
                                                }
                                            </View>
                                            <View className='w-full p-4 bg-white rounded-lg'>
                                                <Text className='text-gray-400 text-xs mb-1'>Reference</Text>
                                                {images && images.length > 0 ? (
                                                    <View className="flex-row flex-wrap gap-2 mt-2">
                                                        {images.map((uri, index) => (
                                                            <Image
                                                                key={index}
                                                                source={{ uri: uri }}
                                                                // Use 'cover' and a fixed square size for a clean grid look
                                                                style={{ width: 90, height: 90, borderRadius: 8 }}
                                                                resizeMode="cover"
                                                            />
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                                        <Text className='text-secondary-light text-lg font-semibold capitalize'>
                                                            No images
                                                        </Text>
                                                    </View>
                                                )}
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
                                                    {pickupTime ? (pickupTime instanceof Date ? pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : pickupTime) : 'None'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className='flex-1 justify-start items-start gap-4 w-full'>
                                        <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                                            <View className='flex-row gap-2 items-center'>
                                                <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                                    <NotepadText style={{ color: '#A67C52' }} />
                                                </View>
                                                <Text className='text-primary text-lg font-semibold'>Contact Information</Text>
                                            </View>
                                            {/* Full Name */}
                                            <View className='flex-row flex-wrap justify-between gap-2'>
                                                <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                    <Text className='text-gray-400 text-xs mb-1'>Full Name</Text>
                                                    <Text className='text-primary text-lg font-semibold capitalize'>
                                                        {fullName || '-'}
                                                    </Text>
                                                </View>

                                                {/* Contact Number */}
                                                <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                    <Text className='text-gray-400 text-xs mb-1'>Contact Number</Text>
                                                    <Text className='text-primary text-lg font-semibold capitalize'>
                                                        {contactNumber || '-'}
                                                    </Text>
                                                </View>

                                                {/* Email */}
                                                <View className='w-full p-4 bg-white rounded-lg'>
                                                    <Text className='text-gray-400 text-xs mb-1'>Email</Text>
                                                    <Text className='text-primary text-lg font-semibold'>
                                                        {email || '-'}
                                                    </Text>
                                                </View>

                                                {/* Address */}
                                                <View className='w-full p-4 bg-white rounded-lg'>
                                                    <Text className='text-gray-400 text-xs mb-1'>Address</Text>
                                                    <Text className='text-primary text-lg font-semibold capitalize'>
                                                        {address || '-'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                </View>
                            )}
                        </View>

                        <View className='flex-row justify-between items-center mt-auto pt-10'>
                            <TouchableOpacity onPress={() => handleChangePage('prev')} className='bg-white border-secondary-light/50 border p-4 rounded-full items-center shadow-sm'>
                                <ArrowLeft style={{ color: '#9A8978' }} />
                            </TouchableOpacity>

                            <Text className='text-secondary-light font-medium'>{page}/{maxPage}</Text>

                            {page === maxPage ?
                                <TouchableOpacity onPress={openPaymentMethodModal} disabled={isSubmitting}>
                                    <View className='bg-secondary-light px-8 py-4 rounded-2xl items-center flex-row gap-2 shadow-sm'>
                                        <Check style={{ color: 'white' }} />
                                        <Text className='text-white font-bold'>Choose Payment Method</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-primary shadow-xl p-4 rounded-full items-center'>
                                    <ArrowRight style={{ color: 'white' }} />
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </ScrollView>

                <Modal
                    visible={showPaymentMethodModal}
                    transparent
                    animationType='fade'
                    onRequestClose={() => setShowPaymentMethodModal(false)}
                >
                    <View className='flex-1 bg-black/50 justify-center items-center px-6'>
                        <View className='bg-white w-full p-6 rounded-3xl shadow-lg border border-[#E5D3C1]'>
                            <Text className='text-xl font-bold mb-1 text-primary'>Select Payment Method</Text>
                            <Text className='text-secondary-strong mb-4'>Choose how you want to settle your downpayment.</Text>

                            <View className='mb-4 rounded-2xl border border-[#E5D3C1] bg-[#FAF3EC] p-4'>
                                <Text className='text-[11px] uppercase tracking-wider text-[#8B5A3C]/70 font-semibold'>Amount Due Now</Text>
                                <Text className='text-3xl font-extrabold text-primary mt-1'>₱ {customDownpaymentAmount.toFixed(2)}</Text>
                                <Text className='text-secondary-light text-xs mt-1'>Custom-order fixed downpayment</Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleSelectPaymentMethod('reference_number')}
                                disabled={isSubmitting}
                                className={`mb-3 rounded-xl border border-[#D6B89F] bg-white px-4 py-4 flex-row items-center gap-3 ${isSubmitting ? 'opacity-60' : ''}`}
                            >
                                <View className='h-10 w-10 rounded-full bg-[#F3E6D7] items-center justify-center'>
                                    <WalletCards size={18} color='#8B5A3C' />
                                </View>
                                <View className='flex-1'>
                                    <Text className='text-primary font-bold'>Reference Number</Text>
                                    <Text className='text-secondary-light text-xs'>Pay to store GCash, then submit your reference number in Orders.</Text>
                                </View>
                                <Text className='text-[#8B5A3C] text-xs font-semibold'>Pay ₱ {customDownpaymentAmount.toFixed(2)}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleSelectPaymentMethod('paymongo')}
                                disabled={isSubmitting}
                                className={`mb-4 rounded-xl bg-[#8B5A3C] px-4 py-4 flex-row items-center gap-3 ${isSubmitting ? 'opacity-60' : ''}`}
                            >
                                <View className='h-10 w-10 rounded-full bg-white/20 items-center justify-center'>
                                    <Link2 size={18} color='white' />
                                </View>
                                <View className='flex-1'>
                                    <Text className='text-white font-bold'>PayMongo Checkout</Text>
                                    <Text className='text-white/80 text-xs'>Pay online securely via GCash through PayMongo.</Text>
                                </View>
                                <Text className='text-white text-xs font-semibold'>Pay ₱ {customDownpaymentAmount.toFixed(2)}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowPaymentMethodModal(false)}
                                disabled={isSubmitting}
                                className='items-center justify-center rounded-xl border border-[#D6B89F] px-4 py-3'
                            >
                                <Text className='text-[#7A4520] font-semibold'>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={showPaymentConfirmationModal}
                    transparent
                    animationType='fade'
                    onRequestClose={handleCancelPaymentConfirmation}
                >
                    <View className='flex-1 bg-black/50 justify-center items-center px-6'>
                        <View className='bg-white w-full p-6 rounded-3xl shadow-lg border border-[#E5D3C1]'>
                            <Text className='text-xl font-bold text-primary mb-2'>Confirm Payment Method</Text>
                            <Text className='text-secondary-strong mb-4'>
                                You selected {selectedPaymentMethodLabel}. Continue to place this order?
                            </Text>

                            <View className='mb-5 rounded-2xl border border-[#E5D3C1] bg-[#FAF3EC] p-4'>
                                <Text className='text-[11px] uppercase tracking-wider text-[#8B5A3C]/70 font-semibold'>Amount Due Now</Text>
                                <Text className='text-2xl font-extrabold text-primary mt-1'>₱ {customDownpaymentAmount.toFixed(2)}</Text>
                            </View>

                            <TouchableOpacity
                                onPress={confirmSelectedPaymentMethod}
                                disabled={isSubmitting}
                                className={`mb-3 rounded-xl bg-[#8B5A3C] px-4 py-4 items-center justify-center ${isSubmitting ? 'opacity-60' : ''}`}
                            >
                                <Text className='text-white font-bold'>Confirm and Continue</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCancelPaymentConfirmation}
                                disabled={isSubmitting}
                                className='items-center justify-center rounded-xl border border-[#D6B89F] px-4 py-3'
                            >
                                <Text className='text-[#7A4520] font-semibold'>Back to Payment Methods</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView >
        </SafeAreaView >
    )
}

export default CustomOrders