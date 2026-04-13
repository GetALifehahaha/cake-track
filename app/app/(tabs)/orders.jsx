import { View, Text, Image, TextInput, TouchableOpacity, ImageBackground, Animated, Easing } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal, ChevronUp } from 'lucide-react-native'
import OrderCard from '@/components/molecules/OrderCard'
import useOrder from '@/hooks/useOrder'
import { AuthContext } from '@/context/AuthContext'
import OrderFilter from '@/components/molecules/OrderFilter'
import { useRouter } from 'expo-router'
import GlobalRefreshScrollView from '@/components/organisms/GlobalRefreshScrollView'
import CakeTraceLoader from '@/components/atoms/CakeTraceLoader'

const COMPLETED_STATUSES = ['completed'];
const ARCHIVABLE_STATUSES = ['completed', 'rejected', 'refunded', 'cancelled'];
const PAGE_SIZE = 10;

const Orders = () => {
	const ordersTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');

	const { user } = useContext(AuthContext)
	const [searchInput, setSearchInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState([]);
	const [showFilter, setShowFilter] = useState(false);
	const [activeTab, setActiveTab] = useState('orders');
	const [visibleCounts, setVisibleCounts] = useState({ orders: PAGE_SIZE, acquired: PAGE_SIZE, archived: PAGE_SIZE });
	const [hasScrolledPastFirstBatch, setHasScrolledPastFirstBatch] = useState({ orders: false, acquired: false, archived: false });
	const [scrollY, setScrollY] = useState(0);
	const [showScrollTopFab, setShowScrollTopFab] = useState(false);
	const [hasFinishedInitialLoad, setHasFinishedInitialLoad] = useState(false);
	const scrollRef = useRef(null);
	const scrollTopAnim = useRef(new Animated.Value(0)).current;
	const router = useRouter();
	const shouldShowScrollTop = hasScrolledPastFirstBatch[activeTab] && scrollY > 220;

	const { data, archivedData, loading, error, refresh, archiveOrder } = useOrder({
		includeArchivedOrders: true,
		searchQuery,
	});

	const onRefresh = async () => {
		await refresh();
	};

	const handleFilterChoose = (selectedStatuses) => {
		setFilters(Array.isArray(selectedStatuses) ? selectedStatuses.slice(0, 3) : []);
	};

	const handleArchiveOrder = async (orderId) => {
		try {
			await archiveOrder(orderId);
			refresh();
		} catch (archiveError) {
			console.error('Archive order failed:', archiveError?.response?.data || archiveError?.message);
		}
	};

	const applySearchQuery = (inputValue = searchInput) => {
		const nextValue = String(inputValue ?? '');
		setSearchInput(nextValue);
		setSearchQuery(nextValue.trim());
	};

	const handleTabChange = (tabName) => {
		setActiveTab(tabName);
		scrollRef.current?.scrollTo({ y: 0, animated: false });
		setScrollY(0);
	};

	const loadNextBatchForTab = (tabName, totalItems) => {
		const currentVisible = visibleCounts[tabName] || PAGE_SIZE;
		if (currentVisible >= totalItems) return;

		const nextVisible = Math.min(currentVisible + PAGE_SIZE, totalItems);

		setVisibleCounts((previous) => ({
			...previous,
			[tabName]: nextVisible,
		}));

		if (currentVisible <= PAGE_SIZE && nextVisible > PAGE_SIZE) {
			setHasScrolledPastFirstBatch((previous) => ({
				...previous,
				[tabName]: true,
			}));
		}
	};

	const handleScroll = ({ nativeEvent }) => {
		const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
		const currentY = contentOffset.y;
		setScrollY(currentY);

		const isNearBottom = layoutMeasurement.height + currentY >= contentSize.height - 120;
		if (!isNearBottom) return;

		if (activeTab === 'orders') {
			loadNextBatchForTab('orders', filteredList.length);
			return;
		}

		if (activeTab === 'acquired') {
			loadNextBatchForTab('acquired', finishedOrders.length);
			return;
		}

		loadNextBatchForTab('archived', archivedOrders.length);
	};

	const handleScrollToTop = () => {
		scrollRef.current?.scrollTo({ y: 0, animated: true });
		setScrollY(0);
	};

	useEffect(() => {
		if (shouldShowScrollTop) {
			setShowScrollTopFab(true);
		}

		Animated.timing(scrollTopAnim, {
			toValue: shouldShowScrollTop ? 1 : 0,
			duration: shouldShowScrollTop ? 220 : 180,
			easing: shouldShowScrollTop ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished && !shouldShowScrollTop) {
				setShowScrollTopFab(false);
			}
		});
	}, [shouldShowScrollTop, scrollTopAnim]);

	useEffect(() => {
		if (!loading) {
			setHasFinishedInitialLoad(true);
		}
	}, [loading]);

	useEffect(() => {
		setVisibleCounts({ orders: PAGE_SIZE, acquired: PAGE_SIZE, archived: PAGE_SIZE });
		setHasScrolledPastFirstBatch({ orders: false, acquired: false, archived: false });
		setScrollY(0);
		scrollRef.current?.scrollTo({ y: 0, animated: false });
	}, [searchQuery, filters, data, archivedData]);

	if (!user) {
		return (
			<ImageBackground source={ordersTexture} style={{ flex: 1 }} resizeMode="cover">
				<SafeAreaView className='flex-1 items-center justify-center p-6' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
					<Image source={require('@/assets/images/logo.jpg')} resizeMode="contain" className='w-32 h-32 rounded-full mb-8' />
					<Text className='text-center text-lg font-bold mb-4'>Please log in to view your orders.</Text>
					<TouchableOpacity className='mt-4 bg-secondary-strong flex-row gap-2 items-center p-2.5 rounded-lg' onPress={() => router.replace('/(auth)/login')}>
						<Text className='text-lg font-bold text-white'>
							Login
						</Text>
					</TouchableOpacity>
				</SafeAreaView>
			</ImageBackground>
		)
	}

	const showInitialLoader = !hasFinishedInitialLoad && loading;

	if (showInitialLoader) return (
		<ImageBackground source={ordersTexture} style={{ flex: 1 }} resizeMode="cover">
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.48)' }}>
				<CakeTraceLoader size={62} trackColor='transparent' />
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

	const allOrders = Array.isArray(data) ? data : [];
	const allArchivedOrders = Array.isArray(archivedData) ? archivedData : [];

	const filteredList = allOrders.filter(order => {
		const matchesStatus = filters.length === 0 || filters.includes(order.status);

		const isActiveOrder = !COMPLETED_STATUSES.includes(String(order.status || '').toLowerCase());

		return matchesStatus && isActiveOrder;
	});

	const finishedOrders = allOrders.filter(order => COMPLETED_STATUSES.includes(String(order.status || '').toLowerCase()));

	const archivedOrders = allArchivedOrders.filter(order => {
		if (!order || typeof order !== 'object') return false;
		const status = String(order.status || '').toLowerCase();

		const isArchivableStatus = ARCHIVABLE_STATUSES.includes(status);

		return isArchivableStatus;
	});

	const visibleOrders = filteredList.slice(0, visibleCounts.orders);
	const visibleFinishedOrders = finishedOrders.slice(0, visibleCounts.acquired);
	const visibleArchivedOrders = archivedOrders.slice(0, visibleCounts.archived);

	const listOrders = visibleOrders.map((order) => (
		<OrderCard key={order.id} order={order} onArchive={handleArchiveOrder} />
	));

	const listCompleteOrders = visibleFinishedOrders.map((order) => (
		<OrderCard key={order.id} order={order} onArchive={handleArchiveOrder} />
	));

	const listArchivedOrders = visibleArchivedOrders.map((order, index) => (
		<TouchableOpacity
			key={order.id || `archived-${index}`}
			className='rounded-xl border border-gray-200 bg-white px-4 py-3'
			onPress={() => router.push({ pathname: '/orderDetails', params: { orderData: JSON.stringify(order) } })}
		>
			<View className='flex-row items-center justify-between'>
				<Text className='font-bold text-primary'>#{order.id}</Text>
				<Text className='text-xs uppercase text-gray-500'>{order.status}</Text>
			</View>
			<Text className='mt-1 text-xs text-gray-500'>
				Due: {order.due_date || 'N/A'}
			</Text>
		</TouchableOpacity>
	));

	const totalOrders = allOrders.length;
	const readyOrders = allOrders.filter(o => o.status === 'ready').length;
	const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
	const activeFilters = filters.map((filter, index) => <Text key={index} className='capitalize font-semibold text-lg text-gray-500'>{filter}</Text>);

	return (
		<ImageBackground source={ordersTexture} style={{ flex: 1 }} resizeMode="repeat">
			<SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(245, 245, 245, 0.02)' }}>
				<View className='flex-row p-6 gap-2 items-center'>
					<View className='flex-1'>
						<View className='flex-row'>
							<Text className='text-primary font-semibold text-xl'>Cake</Text>
							<Text className='text-secondary-strong font-semibold text-xl'>Track</Text>
						</View>
						<Text className='text-gray-500 font-bold text-md'>Order Dashboard</Text>
					</View>

					{/* Dynamic Stats Board */}
					<View className="w-60 max-w-sm flex-row items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 shadow-xl">
  
					{/* Total Orders - Primary focus */}
					<View className="flex-1 items-center border-r border-slate-100">
						<Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</Text>
						<Text className="text-xl font-bold text-slate-900">{totalOrders}</Text>
					</View>

					{/* Ready Orders - Success state */}
					<View className="flex-1 items-center border-r border-slate-100">
						<Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ready</Text>
						<View className="flex-row items-center">
						<View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
						<Text className="text-xl font-bold text-slate-900">{readyOrders}</Text>
						</View>
					</View>

					{/* Pending Orders - Warning state */}
					<View className="flex-1 items-center">
						<Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</Text>
						<View className="flex-row items-center">
						<View className="mr-1.5 h-2 w-2 rounded-full bg-amber-500" />
						<Text className="text-xl font-bold text-slate-900">{pendingOrders}</Text>
						</View>
					</View>

					</View>
				</View>

				<GlobalRefreshScrollView
					ref={scrollRef}
					contentContainerStyle={{ paddingBottom: 20 }}
					onRefresh={onRefresh}
					onScroll={handleScroll}
					scrollEventThrottle={16}
				>
					
					<View className='flex px-6'>
						<View className='w-full flex-row items-center gap-2 bg-white shadow-md py-3 pl-4 pr-2 rounded-full border border-gray-200 mb-3'>
							<TouchableOpacity
								onPress={() => applySearchQuery(searchInput)}
								className='h-9 w-9 rounded-full items-center justify-center bg-[#f7f2eb]'
							>
								<Search opacity={0.7} color="#8B5A3C" size={18} />
							</TouchableOpacity>
							<TextInput
								className='flex-1 px-1 text-[15px]'
								value={searchInput}
								onChangeText={setSearchInput}
								onSubmitEditing={({ nativeEvent }) => applySearchQuery(nativeEvent?.text)}
								onEndEditing={({ nativeEvent }) => applySearchQuery(nativeEvent?.text)}
								blurOnSubmit
								returnKeyType='search'
								placeholder='Search order ID, occasion, or flavor'
								placeholderTextColor="#9ca3af"
								autoCapitalize='none'
							/>
						</View>
						<View className='mb-4 flex-row rounded-full border border-gray-200 bg-white p-1'>
							<TouchableOpacity
								className={`flex-1 rounded-full px-3 py-2 ${activeTab === 'orders' ? 'bg-primary' : 'bg-white'}`}
								onPress={() => handleTabChange('orders')}
							>
								<Text className={`text-center font-semibold ${activeTab === 'orders' ? 'text-white' : 'text-gray-600'}`}>Orders</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className={`flex-1 rounded-full px-3 py-2 ${activeTab === 'acquired' ? 'bg-primary' : 'bg-white'}`}
								onPress={() => handleTabChange('acquired')}
							>
								<Text className={`text-center font-semibold ${activeTab === 'acquired' ? 'text-white' : 'text-gray-600'}`}>Acquired</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className={`flex-1 rounded-full px-3 py-2 ${activeTab === 'archived' ? 'bg-primary' : 'bg-white'}`}
								onPress={() => handleTabChange('archived')}
							>
								<Text className={`text-center font-semibold ${activeTab === 'archived' ? 'text-white' : 'text-gray-600'}`}>Archives</Text>
							</TouchableOpacity>
						</View>

						

						{activeTab === 'orders' && (
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

								{listOrders.length > 0 ?
									<View className="flex gap-4 mt-8">
										{listOrders}
									</View>
									: (
										<View className='items-center justify-center py-10 opacity-50'>
											<Text>No orders found.</Text>
										</View>
									)}
							</View>
						)}

						{activeTab === 'acquired' && (
							<View className='mt-6 gap-4'>
								<View className='flex-row items-center justify-between'>
									<Text className='font-semibold text-lg'>Acquired</Text>
								</View>

								{listCompleteOrders.length > 0 ?
									<View>
										{listCompleteOrders}
									</View>
									: (
										<View className='items-center justify-center py-10 opacity-50'>
											<Text>No completed orders yet.</Text>
										</View>
									)}
							</View>
						)}

						{activeTab === 'archived' && (
							<View className='mt-6 gap-4'>
								<View className='flex-row items-center justify-between'>
									<Text className='font-semibold text-lg'>Archived Orders</Text>
								</View>

								{listArchivedOrders.length > 0 ?
									<View className='gap-2'>
										{listArchivedOrders}
									</View>
									: (
										<View className='items-center justify-center py-10 opacity-50'>
											<Text>No archived orders yet.</Text>
										</View>
									)}
							</View>
						)}
					</View>
				</GlobalRefreshScrollView>
				{showScrollTopFab && (
					<Animated.View
						pointerEvents={shouldShowScrollTop ? 'auto' : 'none'}
						style={{
							position: 'absolute',
							right: 18,
							bottom: 108,
							opacity: scrollTopAnim,
							transform: [
								{
									translateY: scrollTopAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [22, 0],
									}),
								},
								{
									scale: scrollTopAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [0.86, 1],
									}),
								},
							],
						}}
					>
						<TouchableOpacity
							onPress={handleScrollToTop}
							className='h-14 w-14 rounded-full items-center justify-center bg-primary shadow-lg'
						>
							<ChevronUp color='white' size={26} />
						</TouchableOpacity>
					</Animated.View>
				)}
				<OrderFilter activeFilters={filters} show={showFilter} onChoose={handleFilterChoose} onClose={() => setShowFilter(false)} />
			</SafeAreaView>
		</ImageBackground>
	)
}

export default Orders