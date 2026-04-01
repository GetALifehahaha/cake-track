import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { Minus, Plus } from 'lucide-react-native'

const CakeOrderCard = ({ id, image, name, price, description, baseFlavor, addedToCart, addToCart, amount, onSetAmount }) => {

    const handleAddToCart = () => {
        addToCart({ id, name, price, amount: 1, image });
    }

    return (
        <View className='flex-row px-6 py-4 border-b border-b-gray-300 w-full items-center bg-white gap-4'>
            <Image
                style={{ width: 100, height: 100 }}
                resizeMode='contain'
                source={image}
            />


            <View className='flex-1 pl-4 justify-center'>
                <Text className='font-extrabold text-lg mb-1'>{name}</Text>
                {baseFlavor && (
                    <Text className='text-base text-gray-500 mb-1'>Flavor: {baseFlavor.charAt(0).toUpperCase() + baseFlavor.slice(1)}</Text>
                )}
                <View className='flex-row items-center justify-between mt-2 '>

                    <Text className='text-xl font-semibold text-gray-400 w-1/2 pr-4 leading-5'>
                        ₱ {(price)}
                    </Text>

                    <View>
                        {addedToCart ? (
                            <View
                                className='flex-row items-center justify-between px-3 h-8 border-secondary-strong border rounded-full'
                                style={{ width: 90 }}
                            >
                                <TouchableOpacity onPress={() => onSetAmount(id, "minus")}>
                                    <Minus size={16} style={{ color: '#8B5A3C' }} />
                                </TouchableOpacity>

                                <Text className='font-bold text-base text-black'>
                                    {amount}
                                </Text>

                                <TouchableOpacity onPress={() => onSetAmount(id, "add")}>
                                    <Plus size={16} style={{ color: '#8B5A3C' }} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleAddToCart}
                                className='w-8 h-8 rounded-full bg-secondary-light justify-center items-center'
                            >
                                <Plus size={20} style={{ color: 'white' }} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    )
}

export default CakeOrderCard