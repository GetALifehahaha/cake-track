import { View, Text, Image, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { Search } from 'lucide-react-native'
import OrderCard from '@/components/molecules/OrderCard'

const Orders = () => {

  const orderData = [
    {
      id: '001234',
      occassion: 'Birthday Cake',
      status: 'Completed',
      date: '10/30/2025',
      flavor: 'Chocolate',
      isAcquired: false
    },
    {
      id: '001235',
      occassion: 'Birthday Cake',
      status: 'Completed',
      date: '10/30/2025',
      flavor: 'Red Velvet',
      isAcquired: true
    },
    {
      id: '001236',
      occassion: 'Birthday Cake',
      status: 'Pending',
      date: '10/30/2025',
      flavor: 'Chocolate',
      isAcquired: false
    },
  ]

  const [search, setSearch] = useState("");

  const listOrders = orderData.map((order, index) => <OrderCard key={index} order={order} />)

  return (
    <SafeAreaView className='flex-1 bg-main-form'>
      <View className='flex-row p-6 gap-2'>
        <Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='aspect-sqaure w-16 h-16 ' />

        <View>
          <View className='flex-row'>
            <Text className='text-primary font-semibold text-2xl'>Cake</Text>
            <Text className='text-secondary-strong font-semibold text-2xl'>Track</Text>
          </View>
          <Text className='text-text opacity-50 font-bold text-lg'>Order Dashboard</Text>
        </View>

        <View className='flex-row gap-2 rounded-2xl border-2 border-secondary-light bg-white'>
          <View className='p-2 border-r border-r-secondary-light'>
            <Text className='font-semibold'>Total</Text>
            <Text className='text-xl text-text/75'>3</Text>
          </View>
          <View className='p-2 border-r border-r-secondary-light'>
            <Text className='font-semibold'>Ready</Text>
            <Text className='text-xl text-text/75'>3</Text>
          </View>
          <View className='p-2'>
            <Text className='font-semibold'>Pending</Text>
            <Text className='text-xl text-text/75'>3</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        <View className='flex px-6'>
          <View className='flex-row items-center gap-2 bg-white shadow-md p-2 rounded-md'>
            <Search opacity={.50} />
            <TextInput value={search} onChangeText={(text) => setSearch(text)} placeholder='Search orders, ID, or flavor...' />
          </View>


          <View className='mt-2 gap-4'>
            <Text className='font-semibold text-lg py-4'>Active Orders</Text>
            {listOrders}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Orders