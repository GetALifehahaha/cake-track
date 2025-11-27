import { View, Text } from 'react-native'
import React from 'react'
import Checkbox from '../atoms/Checkbox'
import { Cake } from 'lucide-react-native'

const OrderCard = ({ order }) => {

    const statusVariants = {
        pending: 'bg-gray-100 border-gray-500 text-gray-800',
        completed: 'bg-green-100 border-green-500 text-green-800',
    }

    return (
        <View className='border border-secondary-light rounded-xl p-6 bg-white flex-row gap-4 w-full items-center'>
            {order.isAcquired && <Checkbox />}
            <View className='flex-1'>
                <View className='flex-row justify-between items-center'>
                    <Text className='opacity-50 font-medium text-lg'>#{order.id}</Text>
                    <Text className={`px-2 py-1 border rounded-md ${statusVariants[(order.status).toLowerCase()]}`}>{order.status}</Text>
                </View>
                <View className='flex-row justify-between items-center'>
                    <Text className='font-bold text-lg'>{order.occassion}</Text>
                    <Text className='opacity-50 font-medium'>{order.date}</Text>
                </View>
                <View className='p-2 bg-gray-100 flex-row gap-2 items-center'>
                    <Cake opacity={.8} />
                    <Text className='font-medium'>{order.flavor}</Text>
                </View>
            </View>
        </View>
    )
}

export default OrderCard