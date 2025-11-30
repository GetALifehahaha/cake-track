import './global.css';
import { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Keyboard, Alert, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ArrowLeft, ArrowRight, Check, Cake, MessageCircle, MessageSquare, Mail, CakeIcon, NotepadText } from 'lucide-react-native';
import cakeImages from './cakeImages';
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

// Get screen height to set static sizes that won't shrink when keyboard opens
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomOrders = () => {
    const { user, loading: userLoading } = useContext(AuthContext);
    const { showToast } = useToast();
    const { loading, error, postOrder } = useOrder();
    const [customDisplay, setCustomDisplay] = useState("");
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(11);
    const [personallyDesign, setPersonallyDesign] = useState(false);
    const [occasion, setOccasion] = useState("");
    const [specifyOccasion, setSpecifyOccasion] = useState('');
    const [shape, setShape] = useState("");
    const [specifyShape, setSpecifyShape] = useState('');
    const [tier, setTier] = useState(1);
    const [baseFlavor, setBaseFlavor] = useState("");
    const [filling, setFilling] = useState("");
    const [coatingColor, setCoatingColor] = useState("");
    const [border, setBorder] = useState("");
    const [borderColor, setBorderColor] = useState("");
    const [toppings, setToppings] = useState("");
    const [addOn, setAddOn] = useState("");
    const [messageType, setMessageType] = useState("");
    const [message, setMessage] = useState('');
    const [hasCupcakes, setHasCupcakes] = useState(false);
    const [cupcakesCount, setCupcakesCount] = useState(0);
    const [cupcakesFrosting, setCupcakesFrosting] = useState(null);
    const [comments, setComments] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [image, setImage] = useState(null);
    const [fullName, setFullName] = useState(`${user?.first_name} ${user?.last_name || ''}`);
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

    useEffect(() => {
        if (!shape && !tier) return;

        const img =
            cakeImages?.[shape || "round"]?.[tier || 1]?.[baseFlavor || "vanilla"][filling || "none"]
        // const img = cakeImages["round"][2]["vanilla"]["none"]
        //     cakeImages?.[shape]?.[tier]?.[flavor]?.[fill] ??
        setCustomDisplay(img);
    }, [shape, tier, baseFlavor, filling]);

    useEffect(() => {
        if (personallyDesign) setMaxPage(3)
        else setMaxPage(11)
    }, [personallyDesign])

    if (loading || userLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5A3C" />
    </View>

    const orderCake = async () => {
        const payload = {
            // --- Customer Information (Root Level) ---
            full_name: fullName,
            email: email,
            phone_number: contactNumber, // Mapped to 'phone_number'
            address: address,
            due_date: dueDate,
            status: "pending",

            // --- Nested Cake Specifications ---
            cake_orders: {
                occasion: occasion === "other" ? specifyOccasion : occasion,
                shape: shape === "other" ? specifyShape : shape,
                cake_tier: tier, // Mapped to 'cake_tier'
                base_flavor: baseFlavor,
                finish: "smooth", // You might want to create a state variable for this if it's dynamic
                filling: filling,
                coating_color: coatingColor,

                // Included these in the nested object as they belong to the cake
                // (You can move them to root if your backend expects them there)
                border: border,
                border_color: borderColor,
                toppings: toppings,
                addons: addOn,
                message_type: messageType,
                message: messageType === "none" ? "" : message,
            },
            // cupcake_orders: hasCupcakes ?
            //     {
            //         amount: cupcakesCount,
            //         frosting: 'choco'
            //     } : null,

            // --- Other Fields (Root Level or Nested based on your backend model) ---
            // Assuming these stay at the root 'Order' level:

            // Message


            // Cupcakes
            // has_cupcakes: hasCupcakes,
            // cupcake_count: hasCupcakes ? cupcakesCount : 0,
            // cupcake_frosting: hasCupcakes ? cupcakesFrosting : null,

            // Extras


            // Meta
            comments: comments,
            image: image,
        };

        // Log to verify
        console.log(payload);
        // Log it to check
        try {
            console.log(payload);
            await postOrder(payload);

            showToast("Order proceeded succcesfully")
        } catch (err) {
            console.log(err)
            showToast(`Failed to proceed order. Error: ${err}`, "error")
        }

    }

    // --- Validation Logic ---
    const validateCurrentPage = () => {
        switch (page) {
            case 1: // Cake Details (Occasion)
                if (!occasion) {
                    showToast("Please select an occasion", 'error');
                    return false;
                } else if (occasion === "other" && !specifyOccasion) {
                    showToast("Please enter your special occasion", 'error');
                    return false;
                }
                return true;

            case 2: // Form (Shape/Tier)
                if (!shape) {
                    showToast("Please select a cake shape", 'error');
                    return false;
                } else if (shape === "other" && !specifyShape) {
                    showToast("Please specify the shape", 'error');
                    return false;
                }
                if (!tier) {
                    showToast("Please select the number of tiers", 'error');
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
                } else if (!border) {
                    showToast("Please select a border design", 'error');
                    return false;
                } else if (!borderColor) {
                    showToast("Please select a border color", 'error');
                    return false;
                }
                return true;

            case 5: // Add-ons
                return true;

            case 6: // Message
                if (messageType !== "none" && !message) {
                    showToast("Please enter your message", 'error');
                    return false;
                }
                return true;

            case 7: // Cupcakes
                if (hasCupcakes) {
                    if (cupcakesCount <= 0) {
                        showToast("Please specify the number of cupcakes", 'error');
                        return false;
                    }
                    // if (!cupcakesFrosting) {
                    //     showToast("Please select a frosting for the cupcakes", 'error');
                    //     return false;
                    // }
                }
                return true;

            case 8: // Comments + Due Date
                if (!dueDate) {
                    showToast("Please select a due date for your order", 'error');
                    return false;
                }
                return true;

            case 9: // Image
                return true;

            case 10: // Information
                if (!fullName.trim()) {
                    showToast("Please enter your full name", 'error');
                    return false;
                }
                // 1. Remove all spaces and dashes
                const cleanedNumber = contactNumber.replace(/[\s-]/g, '');

                // 2. Validate the clean version
                const phoneRegex = /^\+63\d{10}$/;

                if (!contactNumber.trim()) {
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
                    showToast("Please enter your delivery address", 'error');
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
            // Run validation before moving forward
            if (validateCurrentPage()) {
                setPage(page + 1);
            }
        } else if (direction === 'prev' && page > 1) {
            setPage(page - 1);
        }
    }

    const toggleHasCupcakes = () => {
        setHasCupcakes(!hasCupcakes);
    }

    const pickImage = async () => {
        // Ask permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission denied!");
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const capitalize = (str) => {
        if (!str) return '';
        return str[0].toUpperCase() + str.slice(1)
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
                    {/* 3. IMAGE CONTAINER 
                        Used static height (SCREEN_HEIGHT * 0.35) instead of 'h-[40vh]'. 
                        'vh' is dynamic and shrinks when the keyboard opens, causing UI jumps.
                    */}
                    <View style={{ height: SCREEN_HEIGHT * 0.35 }} className="w-full items-center justify-center p-4">
                        <View className='aspect-square h-[90%] bg-main-form rounded-lg justify-center items-center shadow-sm'>
                            {customDisplay ? (
                                <Image
                                    source={customDisplay}
                                    style={{ width: 200, height: 200 }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text className='text-sm font-semibold text-gray-300'>CAKE PREVIEW</Text>
                            )}
                        </View>
                    </View>

                    {/* 4. FORM CONTAINER 
                        flex-1 ensures it takes all remaining space. 
                        pb-8 adds breathing room at the bottom.
                    */}
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
                                    addOn={addOn} setAddOn={setAddOn}
                                />
                            )}
                            {page === 8 && (
                                <CommentPage
                                    comments={comments} setComments={setComments}
                                    dueDate={dueDate} setDueDate={setDueDate}
                                />
                            )}
                            {page === 9 && (
                                <ImagePage
                                    image={image} setImage={setImage} pickImage={pickImage}
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
                                                            {messageType || 'None'}
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
                                                        <Text className='text-primary text-lg font-semibold'>
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
                                                {image ? (
                                                    <Image
                                                        source={{ uri: image }}
                                                        style={{ width: 200, height: 200 }}
                                                        resizeMode="contain"
                                                    />
                                                ) : (
                                                    <View className='w-full p-4 bg-white rounded-lg justify-center items-center'>
                                                        <Text className='text-secondary-light text-lg font-semibold capitalize'>
                                                            No images
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View className='w-[48%] p-4 bg-white rounded-lg'>
                                                <Text className='text-gray-400 text-xs mb-1'>Due Date</Text>
                                                <Text className='text-primary text-lg font-semibold capitalize'>
                                                    {dueDate ? new Date(dueDate).toDateString() : 'None'}
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
                                // <TouchableOpacity
                                //     onPress={orderCake}
                                //     className='bg-secondary-light px-8 py-4 rounded-2xl items-center flex-row gap-2 shadow-sm'>
                                // </TouchableOpacity>
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