import { View, Text, TouchableOpacity } from 'react-native'
import { Cake, Sparkles } from 'lucide-react-native'
import React, { } from 'react'
import { useRouter } from 'expo-router'

const Cakes = () => {
  const router = useRouter();
  return (
    <View className='flex-1 bg-white'>
      {/* Header */}
      <View className='pt-12 pb-8 w-full border-b border-b-gray-300 bg-white'>
        <Text className='font-bold text-3xl text-center'>Cakes</Text>
      </View>

      <View className='mt-12 w-full items-center gap-2'>
        <Text className='text-[#654321] text-xl font-bold'>Choose Cake Type</Text>
        <Text className='text-[#9A8978] font-medium'>What would you like to order?</Text>
      </View>

      <View className='flex-1 items-center justify-evenly pt-12 pb-24 gap-6'>
        <TouchableOpacity className='border-4 border-[#D4C7B8] aspect-square w-48 rounded-xl items-center justify-center gap-2' onPress={() => router.push('/cakeOrders')}>
          <View className='bg-[#A67C52] rounded-full w-16 h-16 items-center justify-center'>
            <Cake style={{ color: "white" }} size={28} />
          </View>
          <Text className='text-[#654321] font-semibold text-xl'>Pre-made</Text>
          <Text className='text-[#9A8978]'>Ready-made designs</Text>
        </TouchableOpacity>
        <TouchableOpacity className='border-4 border-[#D4C7B8] aspect-square w-48 rounded-xl items-center justify-center gap-2' onPress={() => router.push('/customOrders')}>
          <View className='bg-[#A67C52] rounded-full w-16 h-16 items-center justify-center'>
            <Sparkles style={{ color: "white" }} size={28} />
          </View>
          <Text className='text-[#654321] font-semibold text-xl'>Custom</Text>
          <Text className='text-[] text-center'>Make your own or let the Baker surprise you</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Cakes