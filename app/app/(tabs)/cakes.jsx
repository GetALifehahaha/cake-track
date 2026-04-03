import { View, Text, TouchableOpacity, Image, ImageBackground } from 'react-native'
import { Cake, Sparkles } from 'lucide-react-native'
import React, { } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'

const Cakes = () => {
  const router = useRouter();
  const { user } = useAuth();
  const cakesTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any.jpg');

  if (!user) {
    return (
      <ImageBackground source={cakesTexture} style={{ flex: 1 }} resizeMode='repeat'>
        <SafeAreaView className='flex-1 items-center justify-center p-6' style={{ backgroundColor: 'rgba(255, 255, 255, 0.84)' }}>
          <Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='w-32 h-32 rounded-full mb-8' />
          <Text className='text-center text-lg font-bold mb-4'>Please log in to start ordering.</Text>
          <TouchableOpacity className='mt-4 bg-secondary-strong flex-row gap-2 items-center p-2.5 rounded-lg' onPress={() => router.replace('/login')}>
            <Text className='text-lg font-bold text-white'>
              Login
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    )
  }

  return (
    <ImageBackground source={cakesTexture} style={{ flex: 1 }} resizeMode='repeat'>
      <SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>

        <View className='pt-6 pb-8 w-full border-b border-b-gray-300' style={{ backgroundColor: 'rgba(255, 255, 255, 0.72)' }}>
          <Text className='font-bold text-3xl text-center'>Cakes</Text>
        </View>

        <View className='mt-12 w-full items-center gap-2'>
          <Text className='text-[#654321] text-xl font-bold'>Choose Cake Type</Text>
          <Text className='text-[#9A8978] font-medium'>What would you like to order?</Text>
        </View>
        <View className='flex-1 items-center justify-evenly pt-12 pb-24 gap-6'>
          <TouchableOpacity
            className='border-4 border-[#D4C7B8] aspect-square w-48 rounded-xl items-center justify-center gap-2'
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.72)' }}
            onPress={() => router.push('/cakeOrders')}
          >
            <View className='bg-[#A67C52] rounded-full w-16 h-16 items-center justify-center'>
              <Cake style={{ color: "white" }} size={28} />
            </View>
            <Text className='text-[#654321] font-semibold text-xl'>Pre-made</Text>
            <Text className='text-[#9A8978]'>Ready-made designs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='border-4 border-[#D4C7B8] aspect-square w-48 rounded-xl items-center justify-center gap-2'
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.72)' }}
            onPress={() => router.push('/customOrders')}
          >
            <View className='bg-[#A67C52] rounded-full w-16 h-16 items-center justify-center'>
              <Sparkles style={{ color: "white" }} size={28} />
            </View>
            <Text className='text-[#654321] font-semibold text-xl'>Custom</Text>
            <Text className='text-[] text-center'>Make your own or let the Baker surprise you</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  )
}

export default Cakes