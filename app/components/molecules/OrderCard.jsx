import { View, Text, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import Checkbox from '../atoms/Checkbox'
import { Cake } from 'lucide-react-native'
import { capitalize } from '@/utils/capitalize'
import { router } from 'expo-router'
import Swipeable from 'react-native-gesture-handler/Swipeable'

const HIDEABLE_STATUSES = ['completed', 'refunded', 'rejected', 'cancelled'];

const OrderCard = ({ order, onHide }) => {

    const swipeableRef = useRef(null);

    const statusVariants = {
        unpaid: "text-orange-600 bg-orange-100 border-orange-200",

        pending: "text-secondary-light bg-secondary-light/10 border-secondary-light",

        rejected: "text-red-600 bg-red-100 border-red-200",
        cancelled: "text-red-600 bg-red-100 border-red-200",
        refunded: "text-red-600 bg-red-100 border-red-200",

        // Handle both 'ready' and 'ready_for_pickup' just in case
        ready: "text-yellow-700 bg-yellow-100 border-yellow-200",
        ready_for_pickup: "text-yellow-700 bg-yellow-100 border-yellow-200",

        // Handle both 'completed' and 'accepted'
        completed: "text-green-700 bg-green-100 border-green-200",
        accepted: "text-green-700 bg-green-100 border-green-200",
    };

    const handlePress = () => {
        router.push({
            pathname: '/orderDetails',
            params: { orderData: JSON.stringify(order) }
        });
    }

    const canHide = HIDEABLE_STATUSES.includes(String(order?.status || '').toLowerCase()) && typeof onHide === 'function';

    const handleHide = () => {
        swipeableRef.current?.close();
        onHide(order.id);
    };

    const renderHideAction = () => (
        <View className='justify-center items-center mb-4 mr-1'>
            <TouchableOpacity
                onPress={handleHide}
                activeOpacity={0.8}
                className='bg-red-500 rounded-xl px-5 py-6 min-w-10 h-full items-center justify-center ml-2'
            >
                <Text className='text-white font-semibold text-sm'>H</Text>
                <Text className='text-white font-semibold text-sm'>I</Text>
                <Text className='text-white font-semibold text-sm'>D</Text>
                <Text className='text-white font-semibold text-sm'>E</Text>
            </TouchableOpacity>
        </View>
    );

    const cardBody = (
        <TouchableOpacity onPress={handlePress}
            activeOpacity={0.7}
            className='bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm'>
            <View className='border border-secondary-light rounded-xl p-6 bg-white flex-row gap-4 w-full items-center'>
                {/* {order.isAcquired && <Checkbox />} */}
                <View className='flex-1'>
                    <View className='flex-row justify-between items-center'>
                        <Text className='opacity-50 font-medium text-lg'>#{order.id}</Text>
                        <Text className={`px-2 py-1 border rounded-md overflow-hidden font-medium text-xs ${statusVariants[order.status.toLowerCase()] || "text-gray-600 bg-gray-100 border-gray-200"
                            }`}>{capitalize(order.status)}</Text>
                    </View>
                    <View className='flex-row justify-between items-center'>
                        <Text className='font-bold text-lg'>{capitalize(order.cake_orders.occasion)}</Text>
                        <Text className='opacity-50 font-medium'>{capitalize(order.due_date)}</Text>
                    </View>
                    <View className='p-2 bg-gray-100 flex-row gap-2 items-center'>
                        <Cake opacity={.8} />
                        <Text className='font-medium'>{capitalize(order.cake_orders.base_flavor)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (!canHide) {
        return cardBody;
    }

    return (
        <Swipeable
            ref={swipeableRef}
            overshootRight={false}
            renderRightActions={renderHideAction}
        >
            {cardBody}
        </Swipeable>
    );
}

export default OrderCard