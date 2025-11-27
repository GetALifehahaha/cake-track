import './global.css';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
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

const CustomOrders = () => {
    const [customDisplay, setCustomDisplay] = useState("");
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(10);
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
        else setMaxPage(10)
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


    return (
        <SafeAreaView className='flex-1 bg-[#8B5A3C] items-center justify-center'>
            <View className='h-[40vh] p-8 pt-16'>
                <View className='aspect-square h-full bg-main-form rounded-lg justify-center items-center'>
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

            <View className='bg-main-form w-full flex-1 rounded-t-[3rem]'>
                {/* Header */}
                <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                    <View>
                        <Text className='text-2xl font-semibold text-[#8B5A3C]'>{pageTitles[page - 1]}</Text>
                        <Text className='text-[#9A8978]'>Customize your perfect cake</Text>
                    </View>

                    <TouchableOpacity onPress={() => router.back()}><X style={{ color: '#8B5A3C' }} /></TouchableOpacity>
                </View>

                {page === 1 && (
                    <CakeDetailPage
                        occasion={occasion}
                        setOccasion={setOccasion}
                        specifyOccasion={specifyOccasion}
                        setSpecifyOccasion={setSpecifyOccasion}
                        personallyDesign={personallyDesign}
                        setPersonallyDesign={setPersonallyDesign}
                    />
                )}
                {page === 2 && (
                    <FormPage
                        shape={shape}
                        setShape={setShape}
                        specifyShape={specifyShape}
                        setSpecifyShape={setSpecifyShape}
                        tier={tier}
                        setTier={setTier}
                    />
                )}
                {page === 3 && (
                    <FlavorPage
                        baseFlavor={baseFlavor}
                        setBaseFlavor={setBaseFlavor}
                        filling={filling}
                        setFilling={setFilling}
                    />
                )}
                {page === 4 && (
                    <CoatingPage
                        coatingColor={coatingColor}
                        setCoatingColor={setCoatingColor}
                        border={border}
                        setBorder={setBorder}
                        borderColor={borderColor}
                        setBorderColor={setBorderColor}
                    />
                )}
                {page === 5 && (
                    <AddonPage
                        toppings={toppings}
                        setToppings={setToppings}
                        addOn={addOn}
                        setAddOn={setAddOn}
                    />
                )}
                {page === 6 && (
                    <MessagePage
                        messageType={messageType}
                        setMessageType={setMessageType}
                        message={message}
                        setMessage={setMessage}
                    />
                )}
                {page === 7 && (
                    <CupcakePage
                        hasCupcakes={hasCupcakes}
                        toggleHasCupcakes={toggleHasCupcakes}
                        cupcakesCount={cupcakesCount}
                        setCupcakesCount={setCupcakesCount}
                        cupcakesFrosting={cupcakesFrosting}
                        setCupcakesFrosting={setCupcakesFrosting}
                        addOn={addOn}
                        setAddOn={setAddOn}
                    />
                )}
                {page === 8 && (
                    <CommentPage
                        comments={comments}
                        setComments={setComments}
                        dueDate={dueDate}
                        setDueDate={setDueDate}
                    />
                )}
                {page === 9 && (
                    <ImagePage
                        image={image}
                        setImage={setImage}
                        pickImage={pickImage}
                    />
                )}
                {page === 10 && (
                    <InformationPage
                        fullName={fullName}
                        setFullName={setFullName}
                        address={address}
                        setAddress={setAddress}
                        email={email}
                        setEmail={setEmail}
                        contactNumber={contactNumber}
                        setContactNumber={setContactNumber}
                        agreeToTOC={agreeToTOC}
                        setAgreeToTOC={setAgreeToTOC}
                    />
                )}

                {/* Nax Prev */}
                <View className='flex-row justify-between items-center mt-auto mb-12 px-6'>
                    <TouchableOpacity onPress={() => handleChangePage('prev')} className='bg-white border-secondary-light/50 border m-6 p-4 rounded-full items-center'>
                        <ArrowLeft style={{ color: '#9A8978', backgroundColor: 'white' }} />
                    </TouchableOpacity>
                    <Text className='text-secondary-light'>{page}/{maxPage}</Text>
                    {page === maxPage ?
                        <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-secondary-light m-6 p-4 rounded-2xl items-center flex-row gap-2'>
                            <Check style={{ color: 'white' }} />
                            <Text className='text-white'>Submit</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => handleChangePage('next')} className='bg-secondary-light m-6 p-4 rounded-full items-center'>
                            <ArrowRight style={{ color: 'white' }} />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </SafeAreaView>
    )
}

export default CustomOrders