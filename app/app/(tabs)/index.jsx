import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ImageBackground, ActivityIndicator } from 'react-native'
import React, { useState, useContext } from 'react'
import CakeCard from '@/components/molecules/CakeCard'
import { AuthContext } from '@/context/AuthContext'
import Carousel from 'react-native-reanimated-carousel';
import { Easing } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Star, ArrowRight, TrendingUp } from 'lucide-react-native'; // Ensure you have lucide-react-native installed

const { width } = Dimensions.get('window');

const Index = () => {
    const { user, loading } = useContext(AuthContext)

    // --- DATA ---
    const cakeData = [
        { name: "Chocolate Moist Cake", image: require('@/assets/images/premade-cakes/chocolate-cake.png') },
        { name: "Strawberry Cake", image: require('@/assets/images/premade-cakes/strawberry.png') },
        { name: "Mango Bravo", image: require('@/assets/images/premade-cakes/mango.png') },
        { name: "Mocha Cake", image: require('@/assets/images/premade-cakes/mocha.png') },
        { name: "Vanilla Cake", image: require('@/assets/images/premade-cakes/vanilla-birthday.png') },
        { name: "Red Velvet Cake", image: require('@/assets/images/premade-cakes/red-velvet.png') },
        { name: "Carrot Cake", image: require('@/assets/images/premade-cakes/carrot.png') },
    ]

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

    // --- NEW DATA FOR ADS & BEST SELLERS ---
    const promotions = [
        { id: 1, title: "Wedding Bundle", discount: "20% OFF", bg: require('@/assets/images/carousel-backgrounds/carousel-1.png') },
        { id: 2, title: "Cupcake Party", discount: "Buy 1 Get 1", bg: require('@/assets/images/carousel-backgrounds/carousel-2.png') },
        { id: 3, title: "Coffee Pair", discount: "₱50 OFF", bg: require('@/assets/images/carousel-backgrounds/carousel-3.png') },
    ]

    const bestSellers = [
        { name: "Chocolate Moist Cake", price: "₱800", rating: 4.9, image: require('@/assets/images/premade-cakes/chocolate-cake.png') },
        { name: "Strawberry Cake", price: "₱700", rating: 4.8, image: require('@/assets/images/premade-cakes/strawberry.png') },
        { name: "Mocha Cake", price: "₱750", rating: 4.7, image: require('@/assets/images/premade-cakes/mocha.png') },
    ]


    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5A3C" />
        </View>
    )

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className='bg-[#8B5A3C] flex-1'>
                <Text className='text-white font-extrabold text-lg mt-auto ml-8 pt-20 pb-4'>Greetings, {!user && 'Guest'} {user?.first_name || ''} {user?.last_name || ''}</Text>
                <View className='bg-white w-full mt-auto rounded-t-[2rem] min-h-screen'>
                    
                    {/* Header (UNCHANGED) */}
                    <View className='p-6 w-full flex-row gap-2 items-center'>
                        <Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='aspect-sqaure w-16 h-16 ' />
                        <View className=''>
                            <Text className='text-[#474747] text-3xl font-bold'>Michelle's Cake & Cafe</Text>
                            <View className='flex-row'>
                                <Text className='font-bold text-xl text-[#6B5235]'>Cake</Text>
                                <Text className='font-bold text-xl text-[#BE9B7B]'>Track</Text>
                            </View>
                        </View>
                    </View>

                    {/* Carousel (UNCHANGED) */}
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

                    {/* Premade Cakes (UNCHANGED) */}
                    <View className='relative mb-4'>
                        <Text className='font-extrabold text-lg px-6 py-4 text-[#8B5A3C]'>
                            Pre-made Cakes
                        </Text>

                        <Carousel
                            loop={true}
                            width={width / 2}
                            height={200}
                            style={{ width: width }}
                            data={cakeData}
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
                                                source={item.image}
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

                    {/* --- START OF MODIFIED SECTIONS --- */}

                    {/* 1. More Ads (Now "Promotions") */}
                    <View className='bg-[#FFFBF0] py-6 my-4'>
                        <View className='flex-row items-center justify-between px-6 mb-4'>
                            <Text className='font-extrabold text-lg text-[#8B5A3C]'>Hot Deals!</Text>
                            <TouchableOpacity>
                                <Text className='text-[#BE9B7B] text-xs font-bold'>See All</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                            {promotions.map((promo, index) => (
                                <TouchableOpacity key={index} className='w-72 h-36 rounded-2xl overflow-hidden relative shadow-sm'>
                                    <ImageBackground source={promo.bg} className='w-full h-full justify-center px-6' resizeMode='cover'>
                                        {/* Dark overlay for readability */}
                                        <View className='absolute inset-0 bg-black/20' /> 
                                        
                                        <View className='bg-red-500 self-start px-2 py-1 rounded-md mb-2'>
                                            <Text className='text-white text-[10px] font-bold'>{promo.discount}</Text>
                                        </View>
                                        <Text className='text-white font-bold text-xl'>{promo.title}</Text>
                                        <View className='flex-row items-center mt-2'>
                                            <Text className='text-white font-medium text-xs mr-1'>Claim Offer</Text>
                                            <ArrowRight size={12} color="white" />
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 2. Best Sellers (New Carousel) */}
                    <View className='mb-20'>
                        <View className='flex-row items-center px-6 mb-2 gap-2'>
                            <Text className='font-extrabold text-lg text-[#8B5A3C]'>Best Sellers</Text>
                            <TrendingUp size={20} color="#8B5A3C" />
                        </View>
                        <Text className='px-6 text-gray-500 text-xs mb-4'>Customer favorites you can't miss</Text>

                        <Carousel
                            loop={true}
                            width={width}
                            height={240}
                            data={bestSellers}
                            scrollAnimationDuration={800}
                            mode="parallax"
                            modeConfig={{
                                parallaxScrollingScale: 0.9,
                                parallaxScrollingOffset: 60,
                            }}
                            renderItem={({ item }) => (
                                <View className="flex-1 justify-center items-center">
                                    <View className="w-full h-full bg-white rounded-3xl p-4 flex-row items-center shadow-sm border border-gray-100">
                                        
                                        {/* Left: Image */}
                                        <View className='w-1/2 h-full justify-center items-center'>
                                            <Image source={item.image} className='w-32 h-32' resizeMode='contain' />
                                        </View>

                                        {/* Right: Info */}
                                        <View className='w-1/2 h-full justify-center pr-2'>
                                            <View className='flex-row items-center gap-1 mb-1'>
                                                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                                                <Text className='text-xs font-bold text-gray-600'>{item.rating} (200+)</Text>
                                            </View>
                                            
                                            <Text className='font-bold text-lg text-[#4A4A4A] mb-1 leading-5'>{item.name}</Text>
                                            <Text className='font-extrabold text-xl text-[#8B5A3C] mb-3'>{item.price}</Text>

                                            <TouchableOpacity className='bg-[#8B5A3C] py-2 px-4 rounded-full self-start' onPress={() => router.push('/cakeOrders')}>
                                                <Text className='text-white font-bold text-xs'>Add to Cart</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                    
                </View>
            </View >
        </ScrollView >
    )
}

export default Index