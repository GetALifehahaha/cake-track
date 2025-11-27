import './global.css';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Keyboard } from 'react-native'
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

// Get screen height to set static sizes that won't shrink when keyboard opens
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomOrders = () => {
    const [customDisplay, setCustomDisplay] = useState("");
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(11);
    const [personallyDesign, setPersonallyDesign] = useState(false);
    const [occasion, setOccasion] = useState(null);
    const [specifyOccasion, setSpecifyOccasion] = useState('');
    const [shape, setShape] = useState(null);
    const [specifyShape, setSpecifyShape] = useState('');
    const [tier, setTier] = useState(null);
    const [baseFlavor, setBaseFlavor] = useState(null);
    const [filling, setFilling] = useState(null);
    const [coatingColor, setCoatingColor] = useState(null);
    const [border, setBorder] = useState(null);
    const [borderColor, setBorderColor] = useState(null);
    const [toppings, setToppings] = useState(null);
    const [addOn, setAddOn] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [message, setMessage] = useState('');
    const [hasCupcakes, setHasCupcakes] = useState(false);
    const [cupcakesCount, setCupcakesCount] = useState(0);
    const [cupcakesFrosting, setCupcakesFrosting] = useState(null);
    const [comments, setComments] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [image, setImage] = useState(null);
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
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

    const handleChangePage = (direction) => {
        if (direction === 'next' && page < maxPage) {
            setPage(page + 1);
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

    const capitalize = (str) => str[0].toUpperCase() + str.slice(1)


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
                                            <Text className='text-primary text-lg font-semibold'>{capitalize(occasion)}</Text>
                                        </View>
                                    </View>
                                    <View className='gap-2 p-4 bg-white rounded-xl border border-secondary-light w-full'>
                                        <View className='flex-row gap-2 items-center'>
                                            <View className='bg-gray-100 t w-12 h-12 rounded-full items-center justify-center'>
                                                <Cake style={{ color: '#A67C52' }} />
                                            </View>
                                            <Text className='text-primary text-lg font-semibold'>Cake Specifications</Text>
                                        </View>
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
                                                <>
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
                                                </>
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
                                                <>
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
                                                </>
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
                                                {comments.trim() <= 0 ?
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
                                                        source={image}
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
                                                    {dueDate || 'None'}
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
                                            {/* Using w-full here so long emails don't get cut off */}
                                            <View className='w-full p-4 bg-white rounded-lg'>
                                                <Text className='text-gray-400 text-xs mb-1'>Email</Text>
                                                {/* Removed 'capitalize' for email since emails should be lowercase */}
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
                                <TouchableOpacity className='bg-secondary-light px-8 py-4 rounded-2xl items-center flex-row gap-2 shadow-sm'>
                                    <Check style={{ color: 'white' }} />
                                    <Text className='text-white font-bold'>Submit</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-secondary-light p-4 rounded-full items-center shadow-sm'>
                                    <ArrowRight style={{ color: 'white' }} />
                                </TouchableOpacity>
                            }
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default CustomOrders