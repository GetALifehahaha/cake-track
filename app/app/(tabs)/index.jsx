import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import CakeCard from '@/components/molecules/CakeCard'

const Index = () => {

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

	return (
		<ScrollView>
			<View className='bg-[#8B5A3C] flex-1'>
				<Text className='text-white font-extrabold text-lg mt-auto ml-8 pt-20 pb-4'>Greetings, Mathew Angeles!</Text>
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
					<View className='relative'>
						<Text className='font-extrabold text-lg px-8 py-4'>What's up!</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							onScroll={e => {
								const x = e.nativeEvent.contentOffset.x;
								const current = Math.round(x / (width * 0.9));
								setCarouselDot(current);
							}}
							scrollEventThrottle={16}
						>
							<View className='flex-row gap-2'>
								<View className='w-[5vw] -mr-2'></View>
								<ImageBackground
									source={require('@/assets/images/carousel-backgrounds/carousel-1.png')}
									resizeMode='cover'>
									<View className='w-[90vw] flex-row rounded-[2rem] overflow-hidden px-8 py-16'>
										<View className='w-full'>
											<Text className='text-primary font-bold text-sm'>Must try!</Text>

											<Text className='text-primary font-bold text-2xl mt-4'>Customize your Cake</Text>
											<Text className='text-secondary-strong font-bold text-2xl'>for any occasion</Text>

											<Text className='text-gray-500 font-bold text-sm w-1/2'>Make every moment special with custom cake designs</Text>

											<TouchableOpacity className='p-4 rounded-full bg-primary my-4 self-start'>
												<Text className='text-white font-bold text-xl text-center'>Order Now</Text>
											</TouchableOpacity>
										</View>
									</View>
								</ImageBackground>
								<ImageBackground
									source={require('@/assets/images/carousel-backgrounds/carousel-2.png')}
									resizeMode='cover'
								>
									<View className='w-[90vw] flex-row rounded-[2rem] overflow-hidden px-8 py-16'>
										<View className='w-1/2'>
											<Text className='text-primary font-bold text-sm'>Don't miss!</Text>

											<Text className='text-primary font-bold text-2xl mt-4'>Try our cakes!</Text>
											<Text className='text-secondary-strong font-bold text-2xl'>Ready to enjoy</Text>

											<Text className='text-gray-500 font-bold text-sm'>Delicious Cakes baked fresh and waiting for you</Text>

											<TouchableOpacity className='p-4 rounded-full bg-primary my-4 self-start'>
												<Text className='text-white font-bold text-xl text-center'>Shop Now</Text>
											</TouchableOpacity>
										</View>
									</View>
								</ImageBackground>
								<ImageBackground
									source={require('@/assets/images/carousel-backgrounds/carousel-3.png')}
									resizeMode='cover'
								>
									<View className='w-[90vw] flex-row rounded-[2rem] overflow-hidden px-8 py-16'>
										<View className='w-1/2'>
											<Text className='text-primary font-bold text-sm'>Don't miss!</Text>

											<Text className='text-primary font-bold text-2xl mt-4'>Made For You!</Text>
											<Text className='text-secondary-strong font-bold text-2xl'>Baked with Love</Text>

											<Text className='text-gray-500 font-bold text-sm'>Make every moment remarkable</Text>

											<TouchableOpacity className='p-4 rounded-full bg-primary my-4 self-start'>
												<Text className='text-white font-bold text-xl text-center'>Shop Now</Text>
											</TouchableOpacity>
										</View>
									</View>
								</ImageBackground>
								<View className='w-[5vw] -ml-2'></View>
							</View>
						</ScrollView>

						<View className="flex-row justify-center mt-2 absolute left-1/2 -translate-x-1/2 bottom-8">
							{[0, 1, 2].map((i) => (
								<View
									key={i}
									className={`w-2 h-2 mx-1 rounded-full ${carouselDot === i ? 'bg-primary' : 'bg-gray-300'
										}`}
								/>
							))}
						</View>
					</View>

					{/* Premade Cakes */}
					<View className='relative'>
						<Text className='font-extrabold text-lg px-8 py-4'>Pre-made Cakes</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
						>
							<View className='flex-row gap-2'>
								<View className='w-[5vw] -mr-2'></View>
								{listCakeCards}
								<View className='w-[5vw] -ml-2'></View>
							</View>
						</ScrollView>
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