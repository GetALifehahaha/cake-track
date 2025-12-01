import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native'
import React, { useState, useContext } from 'react'
import CakeCard from '@/components/molecules/CakeCard'
import { AuthContext } from '@/context/AuthContext'
import Carousel from 'react-native-reanimated-carousel';
import { Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Index = () => {
	const { user, loading } = useContext(AuthContext)

	const cakeData = [
		{
			name: "Chocolate Moist Cake",
			image: require('@/assets/images/premade-cakes/chocolate-cake.png')
		},
		{
			name: "Strawberry Cake",
			image: require('@/assets/images/premade-cakes/strawberry.png')
		},
		{
			name: "Mango Bravo",
			image: require('@/assets/images/premade-cakes/mango.png')
		},
		{
			name: "Mocha Cake",
			image: require('@/assets/images/premade-cakes/mocha.png')
		},
		{
			name: "Vanilla Cake",
			image: require('@/assets/images/premade-cakes/vanilla-birthday.png')
		},
		{
			name: "Red Velvet Cake",
			image: require('@/assets/images/premade-cakes/red-velvet.png')
		},
		{
			name: "Carrot Cake",
			image: require('@/assets/images/premade-cakes/carrot.png')
		},
	]

	const [carouselDot, setCarouselDot] = useState(0)
	const { width } = Dimensions.get("window")

	const listCakeCards = cakeData.map((cake, index) =>
		<CakeCard key={index} image={cake.image} text={cake.name} />
	)

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

	if (loading) return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" color="#8B5A3C" />
		</View>
	)

	return (
		<ScrollView>
			<View className='bg-[#8B5A3C] flex-1'>
				<Text className='text-white font-extrabold text-lg mt-auto ml-8 pt-20 pb-4'>Greetings, {user?.first_name || ''} {user?.last_name || ''}</Text>
				<View className='bg-white w-full mt-auto rounded-t-[2rem] h-full'>
					{/* Header */}
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


					{/* Carousel */}
					<View className="items-center justify-center mt-4">
            <Carousel
                loop={true}
                width={width}
                height={width * 0.6} // Adjust height ratio as needed
                autoPlay={true}
                autoPlayInterval={3000} // 5 Seconds
                data={carouselItems}
                scrollAnimationDuration={1000}
                
                // 2. This creates the "Center Big, Sides Small" effect
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.85, // Scale down side items to 85%
                    parallaxScrollingOffset: 100,  // Spacing between items
                }}
                
                // 3. Render the Card
                renderItem={({ item }) => (
                    <View className="flex-1 justify-center items-center">
                        <ImageBackground
                            source={item.bg}
                            imageStyle={{ borderRadius: 30 }} // Round the actual image
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

                                    <TouchableOpacity className='px-6 py-3 rounded-full bg-primary mt-4 self-start shadow-sm'>
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
					<View className='relative mb-8'>
    <Text className='font-extrabold text-lg px-6 py-4 text-[#8B5A3C]'>
        Pre-made Cakes
    </Text>
    
    <Carousel
        loop={true} // Set to true if you want infinite scrolling here too
        width={width / 2} // Show 2 items at once (50% screen width each)
        height={200} // Adjust height to fit image + text
        style={{ width: width }}
        data={cakeData}
		autoPlay={true}
		autoPlayInterval={1}
		scrollAnimationDuration={5000}	
		withAnimation={{
			type: 'timing',
			config: {
				duration: 5000,
				easing: Easing.linear
			}
		}}
        renderItem={({ item }) => (
            <View className="flex-1 px-2 py-2">
                <TouchableOpacity 
                    className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 justify-between items-center"
                    activeOpacity={0.9}
                >
                    {/* Image Container */}
                    <View className="w-full h-32 items-center justify-center mb-2">
                        <Image
                            source={item.image}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Text Details */}
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

					{/* More Ads */}
					<View className='bg-[##FFF3D0] p-8'>
						<View className='flex-row items-center justify-between'>
							<Text className='font-bold text-lg'>Best Creations!</Text>
							<TouchableOpacity>
								<Text className='text-primary font-semibold'>Customize Now</Text>
							</TouchableOpacity>
						</View>
					</View>

					{/* Best Seller */}

				</View>
			</View >
		</ScrollView >
	)
}

export default Index