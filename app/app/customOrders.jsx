import './global.css';
import { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ArrowLeft, ArrowRight, Check, Cake, MessageCircle, MessageSquare, Mail, CakeIcon, NotepadText } from 'lucide-react-native';
import { CAKE_ASSETS as cakeImages } from './cakeImages';
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
import ConfirmModal from '@/components/organisms/ConfirmModal';
import useOrder from '@/hooks/useOrder';
import { AuthContext } from '@/context/AuthContext';
import api from '@/api/api';

// Get screen height to set static sizes that won't shrink when keyboard opens
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomOrders = () => {
    const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME

    const { user, loading: userLoading } = useContext(AuthContext);
    const { selectedAddress } = useLocalSearchParams();
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
    const [contactNumber, setContactNumber] = useState('');
    const [agreeToTOC, setAgreeToTOC] = useState(false);

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


    // Map dropdown values to cakeImages asset keys
    // (Dropdown already sends 'choco'/'straw' directly, so map is identity fallback)
    const fillingKeyMap = {
        choco: 'choco',
        straw: 'straw',
        frosting: 'frosting',
        chocolate: 'choco',
        strawberry: 'straw',
    };

    // Listen for address selected from locationPicker
    useEffect(() => {
        if (selectedAddress) {
            setAddress(selectedAddress);
        }
    }, [selectedAddress]);

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

        // Each "tier" image is a full-cake illustration.
        // tier1 = single-tier cake, tier2 = two-tier (overlays tier1), tier3 = three-tier (overlays tier1+2).
        // Fillings, drips, pipings are also full-cake overlays at specific positions.
        // Correct stacking: bases → fillings → borders → sprinkles (all sequential, NOT interleaved).

        const tierKeys = {
            1: ['tier1'],
            2: ['tier1', 'tier2'],
            3: ['tier1', 'tier2', 'tier3'],
        };

        const positionKeys = {
            1: ['bottom'],
            2: ['bottom', 'middle'],
            3: ['bottom', 'middle', 'top'],
        };

        const tierKeyList = tierKeys[tier] || ['tier1'];
        const positions = positionKeys[tier] || ['bottom'];

        let newLayers = [];

        if (page === 2 || page === 3) {
            // Pages 2-3: Yellow base + optional filling preview
            // Push all bases first
            tierKeyList.forEach(tierKey => {
                const base = assets.bases?.[tierKey]?.yellow;
                if (base) newLayers.push(base);
            });

            // Page 3 only: show fillings on top of all bases
            if (page === 3 && filling) {
                const fillKey = fillingKeyMap[filling] || filling;
                positions.forEach(pos => {
                    const fill = assets.fillings?.[pos]?.[fillKey];
                    if (fill) newLayers.push(fill);
                });
            }

        } else if (page >= 4) {
            // Page 4+: Coating color replaces yellow. Fillings are hidden by coating.
            const activeCoating = coatingColor || 'yellow';

            // 1. All bases
            tierKeyList.forEach(tierKey => {
                const base = assets.bases?.[tierKey]?.[activeCoating];
                if (base) newLayers.push(base);
            });

            // 2. Borders (piping or drip) — on top of all bases
            if (border) {
                if (border === 'piping' && borderColor) {
                    // Round: pipings per tier; Sheet: no piping assets exist
                    tierKeyList.forEach(tierKey => {
                        const pipe = assets.pipings?.[tierKey]?.[borderColor];
                        if (pipe) newLayers.push(pipe);
                    });
                } else if (border === 'drip' && borderColor) {
                    // Sheet: drips per position (bottom/middle/top)
                    if (shape === 'sheet') {
                        positions.forEach(pos => {
                            const drip = assets.drips?.[pos]?.[borderColor];
                            if (drip) newLayers.push(drip);
                        });
                    }
                    // Round: no drip border assets
                }
            }

            // 3. Sprinkles — on top of everything
            if (page >= 5 && toppings === 'sprinkles') {
                const topTierKey = tierKeyList[tierKeyList.length - 1];
                const sprinkle = assets.sprinkles?.pipe?.[topTierKey];
                if (sprinkle) newLayers.push(sprinkle);
            }
        }

        setCustomLayers(newLayers);
    }, [page, shape, tier, filling, coatingColor, border, borderColor, toppings]);



    if (!user) {
        router.replace('/(auth)/login');
    }

    if (loading || userLoading || isSubmitting) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#8B5A3C" />
                {/* Optional: Add text so the user knows why it's taking time */}
                {isSubmitting && <Text className="text-secondary-light mt-2">Processing Order...</Text>}
            </View>
        );
    }

    const orderCake = async () => {
        setIsSubmitting(true); // Start loading spinner

        try {
            let uploadedImageUrls = [];

            let imagesToUpload = [...images];

            // if (!personallyDesign && customDisplay) {
            //     // Resolve the local asset ID (e.g., "1") to a real URI (e.g., "http://.../assets/cake.png")
            //     const asset = Image.resolveAssetSource(customDisplay);
            //     if (asset.uri) {
            //         // Prepend it so it becomes the 'main' image
            //         imagesToUpload.unshift(asset.uri);
            //     }
            // }

            // 1. Upload Image if it exists
            if (imagesToUpload.length > 0) {
                const uploadPromises = imagesToUpload.map(uri => uploadToCloudinary(uri));
                uploadedImageUrls = await Promise.all(uploadPromises);
            }

            // 2. Prepare Payload (Use uploadedImageUrl instead of local 'image')
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

            // Format dates for Django (YYYY-MM-DD and HH:MM:SS)
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
                uploaded_images: uploadedImageUrls // <--- SEND THE CLOUDINARY URL HERE
            };

            // 3. Post to Backend
            const response = await postOrder(payload);

            const newOrderId = response?.id || response?.data?.id;

            if (newOrderId) {
                // Determine if we pay now or later. 
                // If you want ALL orders to pay immediately:
                await handlePayViaGCash(newOrderId);
            } else {
                // Fallback if no ID returned (shouldn't happen if backend is 200 OK)
                showToast("Order placed, but ID missing. Check Order History.");
                router.push('/orderSuccess');
            }

        } catch (err) {
            console.error(err);
            showToast("Failed to place order. Please try again.", "error")
        } finally {
            setIsSubmitting(false); // Stop loading spinner
        }
    }

    // --- Validation Logic ---
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
                return true;

            case 5: // Add-ons
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
                // If personally designing, force them to add a comment describing the cake
                if (personallyDesign && (!comments || comments.trim() === "")) {
                    showToast("Please describe your custom design in the comments", 'error');
                    return false;
                }
                return true;

            case 9: // Image
                // NEW: If personally designing, an image reference is required
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

                const cleanedNumber = contactNumber.replace(/[\s-]/g, '');
                const phoneRegex = /^(\+63\d{10}|09\d{9})$/;

                if (!contactNumber.trim()) {
                    showToast("Please enter your contact number", 'error');
                    return false;
                } else if (!phoneRegex.test(cleanedNumber.trim())) {
                    showToast("Number must start with +63 or 09 (e.g. +639123456789 or 09123456789)", 'error');
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
                return true;

            default:
                return true;
        }
    };

    // --- FIX 2: Updated Logic to Skip Pages 4 and 5 if personallyDesign is true ---
    const handleChangePage = (direction) => {
        if (direction === 'next' && page < maxPage) {
            if (validateCurrentPage()) {
                // --- NEW LOGIC: Personally Design Flow ---
                if (personallyDesign && page === 1) {
                    // Skip Pages 2-7 (Form, Flavors, Coating, Addons, Message, Cupcakes)
                    // Jump straight to Page 8 (Comments/Due Date)
                    setPage(8);
                }
                else {
                    setPage(page + 1);
                }
            }
        } else if (direction === 'prev' && page > 1) {
            // --- NEW LOGIC: Back Button for Personally Design ---
            if (personallyDesign && page === 8) {
                // If on Comments page and it's a personal design, go back to Page 1
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
        // Limit total images to 6
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
            allowsMultipleSelection: true, // Allow selecting multiple
            selectionLimit: 5 - images.length, // Dynamic limit
            quality: 1,
        });

        if (!result.canceled) {
            // Append new images to existing list
            const newUris = result.assets.map(asset => asset.uri);
            setImages([...images, ...newUris]);
        }
    };

    const uploadToCloudinary = async (imageUri) => {
        if (!imageUri) return null;

        // Extract the file name and type from the URI
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        
        // REACT NATIVE SPECIFIC: formatting the file object
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
                    // Note: Do NOT set 'Content-Type': 'multipart/form-data' header manually. 
                    // Fetch does this automatically with the correct boundary.
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

    const handlePayViaGCash = async (orderId) => {
        try {
            showToast("Initiating GCash payment...", "info");
            
            const payload = { order_id: orderId };
            
            // Call Backend to get Checkout URL
            const response = await api.post(`/payment/initiate/`, payload);
            const { checkout_url } = response.data;

            if (checkout_url) {
                // Navigate to PaymentScreen using Expo Router
                // Make sure your PaymentScreen file is named 'PaymentScreen.js' inside your app folder 
                // or adjust the pathname accordingly (e.g., '/payment')
                router.push({
                    pathname: '/paymentScreen', 
                    params: { 
                        checkoutUrl: checkout_url, 
                        orderId: orderId 
                    }
                });
            }
        } catch (error) {
            console.error("Payment Error:", error.response?.data || error.message);
            showToast("Error initiating payment. You can retry from your orders.", "error");
            router.replace('/(tabs)/orders');
        }
    };

    function formatText(str) {
        return str
            .split('_')                 // ["On", "both"]
            .map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' ');                 // "On Both"
    }


    return (
        <SafeAreaView className='flex-1 bg-[#8B5A3C]'>
            {/* 1. Behavior: 'padding' is best for iOS. Android often handles this automatically.
               If you see double spacing on Android, change it to undefined for Platform.OS === 'android' 
            */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    className="flex-1"
                    // 2. This ensures the white background stretches to the bottom even if content is short
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* IMAGE CONTAINER */}
                    <View style={{ height: SCREEN_HEIGHT * 0.35 }} className="w-full items-center justify-center p-4">
                        <View className='aspect-square h-[90%] bg-main-form rounded-lg justify-center items-center shadow-sm'>
                            {personallyDesign ? (
                                <View className="items-center">
                                    <Text className='text-sm font-semibold text-gray-300'>CUSTOM DESIGN</Text>
                                    <Text className='text-xs text-gray-400'>Please upload reference on Page 9</Text>
                                </View>
                            ) : (
                                shape === "other" ? (
                                    <Text className='text-sm font-semibold text-gray-300'>NO PREVIEW</Text>
                                ) : customLayers.length > 0 ? (
                                    <View style={{ width: 200, height: 200 }}>
                                        {customLayers.map((layerSource, index) => (
                                            <Image 
                                                key={index} 
                                                source={layerSource} 
                                                style={{ width: '100%', height: '100%', position: 'absolute' }} 
                                                resizeMode="contain" 
                                            />
                                        ))}
                                    </View>
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

                        {/* Page Content - Wrapped in a View to ensure structure */}
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
                                    contactNumber={contactNumber} setContactNumber={setContactNumber}
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

                                    <View className='flex-1 justify-start items-start gap-4 w-full'>
                                        <View className='flex-col gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                                            <Text className='font-semibold text-secondary-light text-center'>You will be asked to pay ₱ 500.00 as a downpayment</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Navigation Footer */}
                        {/* mt-auto pushes this to the bottom of the white section */}
                        <View className='flex-row justify-between items-center mt-auto pt-10'>
                            <TouchableOpacity onPress={() => handleChangePage('prev')} className='bg-white border-secondary-light/50 border p-4 rounded-full items-center shadow-sm'>
                                <ArrowLeft style={{ color: '#9A8978' }} />
                            </TouchableOpacity>

                            <Text className='text-secondary-light font-medium'>{page}/{maxPage}</Text>

                            {page === maxPage ?
                                <ConfirmModal details={"Place order? This action cannot be undone."} onConfirm={orderCake}>
                                    <View className='bg-secondary-light px-8 py-4 rounded-2xl items-center flex-row gap-2 shadow-sm'>
                                        <Check style={{ color: 'white' }} />
                                        <Text className='text-white font-bold'>Submit</Text>
                                    </View>
                                </ConfirmModal>
                                :
                                <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-secondary-light p-4 rounded-full items-center shadow-sm'>
                                    <ArrowRight style={{ color: 'white' }} />
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView >
        </SafeAreaView >
    )
}

export default CustomOrders