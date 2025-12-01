import { View, Text, Image, TextInput, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useContext, useState } from 'react'
import { Search } from 'lucide-react-native'
import OrderCard from '@/components/molecules/OrderCard'
import useOrder from '@/hooks/useOrder'
import { AuthContext } from '@/context/AuthContext'

const Orders = () => {
  
  const {user} = useContext(AuthContext)
  const [search, setSearch] = useState("");
  
  if (!user) {
    return (
      <SafeAreaView className='flex-1 bg-white items-center justify-center p-6'>
        <Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='w-32 h-32 rounded-full mb-8' />
        <Text className='text-center text-lg font-bold mb-4'>Please log in to view your orders.</Text>
        <TouchableOpacity className='mt-4 bg-secondary-strong flex-row gap-2 items-center p-2.5 rounded-lg' onPress={() => router.replace('(auth)/login')}>
          <Text className='text-lg font-bold text-white'>
            Login
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }
  const {data, loading, error, refresh} = useOrder();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);  // Start animation
    await refresh();      // Wait for new data from backend
    setRefreshing(false); // Stop animation
  };

  if (loading && !refreshing) return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5A3C" />
      </View>
  )

  if (error) return <Text>Error</Text>

  const listOrders = data.results.map((order, index) => (
      <OrderCard key={index} order={order} />
  ))

  // Calculate stats based on actual data
  const totalOrders = data.count;
  const readyOrders = data.results.filter(o => o.status === 'complete').length;
  const pendingOrders = data.results.filter(o => o.status === 'pending').length;

  return (
    <SafeAreaView className='flex-1 bg-[#F5F5F5]'> {/* Fixed bg color */}
      <View className='flex-row p-6 gap-2'>
        <Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='aspect-sqaure w-16 h-16 rounded-full' />

        <View className='flex-1'>
          <View className='flex-row'>
            <Text className='text-primary font-semibold text-2xl'>Cake</Text>
            <Text className='text-secondary-strong font-semibold text-2xl'>Track</Text>
          </View>
          <Text className='text-gray-500 font-bold text-lg'>Order Dashboard</Text>
        </View>

        {/* Dynamic Stats Board */}
        <View className='flex-row gap-2 rounded-2xl border-2 border-secondary-light bg-white h-16 items-center'>
          <View className='px-3 border-r border-r-secondary-light items-center'>
            <Text className='font-semibold text-xs'>Total</Text>
            <Text className='text-lg text-gray-700'>{totalOrders}</Text>
          </View>
          <View className='px-3 border-r border-r-secondary-light items-center'>
            <Text className='font-semibold text-xs'>Ready</Text>
            <Text className='text-lg text-gray-700'>{readyOrders}</Text>
          </View>
          <View className='px-3 items-center'>
            <Text className='font-semibold text-xs'>Pending</Text>
            <Text className='text-lg text-gray-700'>{pendingOrders}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={['#8B5A3C']} // Android loading color (Brown)
                tintColor="#8B5A3C"  // iOS loading spinner color (Brown)
            />}
        >
        <View className='flex px-6'>
          <View className='flex-row items-center gap-2 bg-white shadow-md p-3 rounded-md border border-gray-200'>
            <Search opacity={.50} color="gray" />
            <TextInput 
                className='flex-1'
                value={search} 
                onChangeText={(text) => setSearch(text)} 
                placeholder='Search orders...' 
            />
          </View>

          <View className='mt-6 gap-4'>
            <Text className='font-semibold text-lg'>Active Orders</Text>
            
            {/* 3. EMPTY STATE: Show this if there are no orders */}
            {listOrders.length > 0 ? 
                <View>
                  {listOrders}
                </View>
             : (
                <View className='items-center justify-center py-10 opacity-50'>
                    <Text>No orders found.</Text>
                </View>
            )}
            
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Orders