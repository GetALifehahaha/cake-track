import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ImageBackground, ActivityIndicator } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import CakeCard from '@/components/molecules/CakeCard'
import { AuthContext } from '@/context/AuthContext'
import { OpeningContext } from '@/context/OpeningContext'
import Carousel from 'react-native-reanimated-carousel';
import { Easing } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Star, ArrowRight, TrendingUp } from 'lucide-react-native';
import api from '@/api/api';

const { width } = Dimensions.get('window');
const greetingsTexture = require('@/assets/images/texture/Cake back Designs Greetings area.jpg');
const cakesTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any.jpg');

export default function Index() {
    const { user, loading } = useContext(AuthContext)
    const { openingTime, blockedDates, loading: loadingOpening } = useContext(OpeningContext)

    const [cakes, setCakes] = useState([]);
    const [loadingCakes, setLoadingCakes] = useState(true);

    useEffect(() => {
        const fetchCakes = async () => {
            try {
                const response = await api.get('/orders/cakes/');
                const data = response.data.results || response.data;
                setCakes(data);
            } catch (error) {
                console.error("Failed to fetch cakes for carousel:", error);
            } finally {
                setLoadingCakes(false);
            }
        };

        fetchCakes();
    }, []);

    const carouselItems = [
        {
            id: 1,
            bg: require('@/assets/images/carousel-backgrounds/carousel-1.png'),
            tag: "Must try!",
            title1: "Customize your Cake",
            title2: "for any occasion",
            desc: "Make every moment special with custom cake designs",
            btnText: "Order Now"
        },
        {
            id: 2,
            bg: require('@/assets/images/carousel-backgrounds/carousel-2.png'),
            tag: "Don't miss!",
            title1: "Try our cakes!",
            title2: "Ready to enjoy",
            desc: "Delicious Cakes baked fresh and waiting for you",
            btnText: "Shop Now"
        },
        {
            id: 3,
            bg: require('@/assets/images/carousel-backgrounds/carousel-3.png'),
            tag: "Made For You!",
            title1: "Made For You!",
            title2: "Baked with Love",
            desc: "Make every moment remarkable",
            btnText: "Shop Now"
        }
    ];

    const bestCreationBanners = [
        { id: 1, image: require('@/assets/images/best-creations/Best Creations 1st.jpg') },
        { id: 2, image: require('@/assets/images/best-creations/Best Creations 2nd.jpg') },
        { id: 3, image: require('@/assets/images/best-creations/Best Creations 3rd.jpg') },
        { id: 4, image: require('@/assets/images/best-creations/Best Creations 4th.jpg') },
        { id: 5, image: require('@/assets/images/best-creations/Best Creations 5th.jpg') },
    ];

    if (loading || loadingOpening) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5A3C" />
        </View>
    )

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <ImageBackground source={greetingsTexture} resizeMode='cover'>
                <View className='bg-[#8B5A3C]/80 flex-1'>
                    <Text className='text-white font-extrabold text-lg mt-auto ml-8 pt-20 pb-4'>
                        Greetings, {!user && 'Guest'}{user?.first_name || ''} {user?.last_name || ''}
                    </Text>
                    <ImageBackground
                        source={greetingsTexture}
                        resizeMode='repeat'
                        imageStyle={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
                        className='w-full mt-auto rounded-t-[2rem] min-h-screen overflow-hidden'
                    >
                        <View className='w-full min-h-screen rounded-t-[2rem]' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>

                            {/* Header */}
                            <View className='p-6 w-full flex-row gap-2 items-center'>
                                <Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='aspect-square w-16 h-16 ' />
                                <View className=''>
                                    <Text className='text-[#474747] text-3xl font-bold'>Michelle's Cake & Cafe</Text>
                                    <View className='flex-row'>
                                        <Text className='font-bold text-xl text-[#6B5235]'>Cake</Text>
                                        <Text className='font-bold text-xl text-[#BE9B7B]'>Track</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Carousel */}
                            <View className="items-center justify-center mt-4">
                                <Carousel
                                    loop={true}
                                    width={width}
                                    height={width * 0.6}
                                    autoPlay={true}
                                    autoPlayInterval={3000}
                                    data={carouselItems}
                                    scrollAnimationDuration={1000}
                                    mode="parallax"
                                    modeConfig={{
                                        parallaxScrollingScale: 0.85,
                                        parallaxScrollingOffset: 100,
                                    }}
                                    renderItem={({ item }) => (
                                        <View className="flex-1 justify-center items-center">
                                            <ImageBackground
                                                source={item.bg}
                                                imageStyle={{ borderRadius: 30 }}
                                                className="w-full h-full justify-center overflow-hidden rounded-[2rem] shadow-lg"
                                                resizeMode='cover'
                                            >
                                                <View className="px-6 py-8 h-full justify-center">
                                                    <View className="w-2/3">
                                                        <Text className='text-primary font-bold text-sm bg-white/80 self-start px-2 py-1 rounded-md overflow-hidden'>
                                                            {item.tag}
                                                        </Text>
                                                        <Text className='text-primary font-bold text-2xl mt-3 leading-tight'>
                                                            {item.title1}
                                                        </Text>
                                                        <Text className='text-secondary-strong font-bold text-2xl leading-tight'>
                                                            {item.title2}
                                                        </Text>
                                                        <Text className='text-gray-600 font-bold text-xs mt-2'>
                                                            {item.desc}
                                                        </Text>
                                                        <TouchableOpacity className='px-6 py-3 rounded-full bg-primary mt-4 self-start shadow-sm'
                                                            onPress={() => router.push('/customOrders')}
                                                        >
                                                            <Text className='text-white font-bold text-xs text-center '>
                                                                {item.btnText}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </ImageBackground>
                                        </View>
                                    )}
                                />
                            </View>

                            {/* Premade Cakes */}
                            <View className='relative mb-4'>
                                <Text className='font-extrabold text-lg px-6 py-4 text-[#8B5A3C]'>
                                    Pre-made Cakes
                                </Text>

                                <Carousel
                                    loop={true}
                                    width={width / 2}
                                    height={200}
                                    style={{ width: width }}
                                    data={cakes}
                                    autoPlay={true}
                                    autoPlayInterval={1}
                                    scrollAnimationDuration={5000}
                                    withAnimation={{
                                        type: 'timing',
                                        config: { duration: 5000, easing: Easing.linear }
                                    }}
                                    renderItem={({ item }) => (
                                        <View className="flex-1 px-2 py-2">
                                            <TouchableOpacity
                                                className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 justify-between items-center"
                                                activeOpacity={0.9}
                                            >
                                                <View className="w-full h-32 items-center justify-center mb-2">
                                                    <Image
                                                        source={{ uri: item.image }}
                                                        style={{ width: '100%', height: '100%' }}
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                                <View className="w-full items-center">
                                                    <Text className="text-primary font-bold text-center text-sm" numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>

                            {/* Best Creations Banners */}
                            {/* <View className='px-6 mb-10'>
                        {customBanners.map((banner) => (
                            <TouchableOpacity 
                                key={banner.id} 
                                className='w-full h-40 mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100'
                                activeOpacity={0.9}
                                onPress={() => router.push('/customOrders')}
                            >
                                <Image source={banner.image} className='w-full h-full' resizeMode='cover' />
                            </TouchableOpacity>
                        ))}
                    </View> */}

                            {/* Best Creations Banners (Hardcoded Temporarily) */}
                            <View className='mb-10 mt-4'>
                                <View className='flex-row justify-between items-center px-6 mb-4'>
                                    <Text className='font-extrabold text-lg text-black'>Best Creations!</Text>
                                    <TouchableOpacity onPress={() => router.push('/customOrders')}>
                                        <Text className='text-[#8B5A3C] font-bold text-sm'>Customize Now</Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                                    {bestCreationBanners.map((banner) => (
                                        <TouchableOpacity
                                            key={banner.id}
                                            className='w-80 h-48 rounded-2xl overflow-hidden shadow-sm border border-gray-100'
                                            activeOpacity={0.9}
                                            onPress={() => router.push('/customOrders')}
                                        >
                                            <Image source={banner.image} className='w-full h-full' resizeMode='cover' />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Footer */}
                            <View className='bg-[#F9F9F9] px-6 py-8 border-t border-gray-200'>
                                <Text className='font-bold text-lg text-[#474747] mb-2'>Michelle's Cake & Cafe</Text>
                                <Text className='text-gray-500 text-xs mb-6'>Making your sweet moments unforgettable with custom and pre-made cakes baked with love.</Text>

                                <View className='flex-row flex-wrap justify-between'>
                                    <View className='w-1/2 mb-4'>
                                        <Text className='font-bold text-[#8B5A3C] mb-3'>Support</Text>
                                        {/* <TouchableOpacity><Text className='text-gray-500 text-xs mb-2'>Contact Us</Text></TouchableOpacity> */}
                                        <TouchableOpacity onPress={() => router.push('/faq')}><Text className='text-gray-500 text-xs mb-2'>FAQ</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => router.push('/orders')}><Text className='text-gray-500 text-xs mb-2'>Track Order</Text></TouchableOpacity>
                                    </View>
                                    <View className='w-1/2 mb-4'>
                                        <Text className='font-bold text-[#8B5A3C] mb-3'>Company</Text>
                                        {/* <TouchableOpacity><Text className='text-gray-500 text-xs mb-2'>About Us</Text></TouchableOpacity> */}
                                        <TouchableOpacity onPress={() => router.push('/termsOfService')}><Text className='text-gray-500 text-xs mb-2'>Terms of Service</Text></TouchableOpacity>
                                        {/* <TouchableOpacity><Text className='text-gray-500 text-xs mb-2'>Privacy Policy</Text></TouchableOpacity> */}
                                    </View>
                                </View>

                                <Text className='text-center text-gray-400 text-[10px] mt-8'>© 2026 Michelle's Cake & Cafe. All rights reserved.</Text>
                            </View>

                        </View>
                    </ImageBackground>
                </View>
            </ImageBackground>
        </ScrollView >
    )
}