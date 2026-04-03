import { View, Text, Image, TextInput, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useContext, useState } from 'react'
import { Filter, Option, Search, SlidersHorizontal } from 'lucide-react-native'
import OrderCard from '@/components/molecules/OrderCard'
import useOrder from '@/hooks/useOrder'
import { AuthContext } from '@/context/AuthContext'
import OrderFilter from '@/components/molecules/OrderFilter'
import { useRouter } from 'expo-router'

const Orders = () => {
	const ordersTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');

	const { user } = useContext(AuthContext)
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState([]);
	const [showFilter, setShowFilter] = useState(false);
	const router = useRouter();

	const { data, loading, error, refresh } = useOrder();

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true); 
		await refresh();      
		setRefreshing(false); 
	};

	const handleFilterChoose = (selectedStatuses) => {
		setFilters(selectedStatuses);
	};

	if (!user) {
		return (
			<ImageBackground source={ordersTexture} style={{ flex: 1 }} resizeMode="cover">
				<SafeAreaView className='flex-1 items-center justify-center p-6' style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
					<Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='w-32 h-32 rounded-full mb-8' />
					<Text className='text-center text-lg font-bold mb-4'>Please log in to view your orders.</Text>
					<TouchableOpacity className='mt-4 bg-secondary-strong flex-row gap-2 items-center p-2.5 rounded-lg' onPress={() => router.replace('/login')}>
						<Text className='text-lg font-bold text-white'>
							Login
						</Text>
					</TouchableOpacity>
				</SafeAreaView>
			</ImageBackground>
		)
	}

	if (loading && !refreshing) return (
		<ImageBackground source={ordersTexture} style={{ flex: 1 }} resizeMode="cover">
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
				<ActivityIndicator size="large" color="#8B5A3C" />
			</View>
		</ImageBackground>
	)

	if (error) return (
		<ImageBackground source={ordersTexture} style={{ flex: 1 }} resizeMode="cover">
			<SafeAreaView className='flex-1 items-center justify-center' style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
				<Text>Error loading orders.</Text>
			</SafeAreaView>
		</ImageBackground>
	)

	const filteredList = data?.results?.filter(order => {
		const query = search.toLowerCase().trim();
		const orderId = order.id.toString();

		const matchesSearch = search === "" ||
			orderId.includes(query)

		const matchesStatus = filters.length === 0 || filters.includes(order.status);

		const isNotCompleted = order.status !== "completed";

		return matchesSearch && matchesStatus && isNotCompleted;
	}) || [];

	const listOrders = filteredList.map((order, index) => (
		<OrderCard key={index} order={order} />
	))

	const finishedOrders = data?.results?.filter(order => order.status == "completed") || []

	const listCompleteOrders = finishedOrders.map((order, index) => (
		<OrderCard key={index} order={order} />
	))

	// Calculate stats based on actual data
	const totalOrders = data?.count || 0;
	const readyOrders = data?.results?.filter(o => o.status === 'ready').length || 0;
	const pendingOrders = data?.results?.filter(o => o.status === 'pending').length || 0;
	const activeFilters = filters.map((filter, index) => <Text key={index} className='capitalize font-semibold text-lg text-gray-500'>{filter}</Text>)

	return (
		<ImageBackground source={ordersTexture} style={{ flex: 1 }} resizeMode="cover">
		<SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(245, 245, 245, 0.82)' }}>
			<View className='flex-row p-6 gap-2 items-center'>
				<Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='aspect-sqaure w-16 h-16 rounded-full' />

				<View className='flex-1'>
					<View className='flex-row'>
						<Text className='text-primary font-semibold text-xl'>Cake</Text>
						<Text className='text-secondary-strong font-semibold text-xl'>Track</Text>
					</View>
					<Text className='text-gray-500 font-bold text-md'>Order Dashboard</Text>
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
						<View className='flex-row items-center justify-between'>
							<Text className='font-semibold text-lg'>Orders</Text>

							<TouchableOpacity className='flex-row items-center gap-2' onPress={() => setShowFilter(true)}>
								<View className='font-semibold text-lg text-gray-500 flex-row gap-2'>
									{activeFilters}
									{filters.length === 0 && <Text className='font-semibold text-lg text-gray-500'>Filters</Text>}
								</View>
								<SlidersHorizontal />
							</TouchableOpacity>
						</View>

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

					<View className='mt-6 gap-4'>
						<View className='flex-row items-center justify-between'>
							<Text className='font-semibold text-lg'>Acquired</Text>
						</View>

						{/* 3. EMPTY STATE: Show this if there are no orders */}
						{listCompleteOrders.length > 0 ?
							<View>
								{listCompleteOrders}
							</View>
							: (
								<View className='items-center justify-center py-10 opacity-50'>
									<Text>No finished orders yet.</Text>
								</View>
							)}
					</View>
				</View>
			</ScrollView>
			<OrderFilter activeFilters={filters} show={showFilter} onChoose={handleFilterChoose} onClose={() => setShowFilter(false)} />
		</SafeAreaView>
		</ImageBackground>
	)
}

export default Orders