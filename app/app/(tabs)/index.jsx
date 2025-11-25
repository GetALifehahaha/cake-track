import { View, Text } from 'react-native'
import React from 'react'

const Index = () => {
	return (
		<View className='bg-[#8B5A3C] flex-1'>
			<View className='bg-white w-full mt-auto rounded-t-[2rem] h-[80vh]'>
				{/* Header */}
				<View className='p-6 w-full'>
					<Text className='text-[#474747] text-3xl font-bold'>Michelle's Cake & Cafe</Text>
					<View className='flex-row'>
						<Text className='font-bold text-xl text-[#6B5235]'>Cake</Text>
						<Text className='font-bold text-xl text-[#BE9B7B]'>Track</Text>
					</View>
				</View>


				{/* Carousel */}
				<View>
					<Text></Text>
				</View>
			</View>
		</View>
)
}

export default Index