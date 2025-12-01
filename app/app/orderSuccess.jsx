import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CheckCircle2 } from 'lucide-react-native'

const OrderSuccess = () => {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center gap-4">
      <View className='animate-bounce'>
        <CheckCircle2  size={64} style={{color: "#BE9B7B"}}/>
      </View>
      <Text className='font-bold text-2xl text-primary'>Order Placed Successfully!</Text>
      <TouchableOpacity onPress={() => router.replace('/')} className='px-4 py-2 rounded-xl bg-secondary-light'>
        <Text className='text-white font-bold text-lg'>BACK</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default OrderSuccess