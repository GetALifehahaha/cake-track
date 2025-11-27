import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { ArrowLeft, Calendar, Search } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import CakeOrderCard from '@/components/molecules/CakeOrderCard'
import { useCart } from '@/context/CartContext'

const CakeOrders = () => {

    const cakeData = [
        {
            id: 1,
            name: "Chocolate Moist Cake",
            description: "A moist chocolate cake classic with bold flavor",
            price: 800.00,
            image: require('@/assets/images/premade-cakes/chocolate-cake.png')
        },
        {
            id: 2,
            name: "Strawberry Cake",
            description: "Light, fruity, and full of charm",
            price: 700.00,
            image: require('@/assets/images/premade-cakes/strawberry.png')
        },
        {
            id: 3,
            name: "Mango Bravo",
            description: "A tropical favorite with a flair",
            price: 750.00,
            image: require('@/assets/images/premade-cakes/mango.png')
        },
        {
            id: 4,
            name: "Mocha Cake",
            description: "Bold, smooth, and worth savoring",
            price: 600.00,
            image: require('@/assets/images/premade-cakes/mocha.png')
        },
        {
            id: 5,
            name: "Vanilla Cake",
            description: "Simple, soft, and a timeless classic",
            price: 600.00,
            image: require('@/assets/images/premade-cakes/vanilla-birthday.png')
        },
        {
            id: 6,
            name: "Red Velvet Cake",
            description: "Classic red sponge, tangy cheese frosting.",
            price: 850.00,
            image: require('@/assets/images/premade-cakes/red-velvet.png')
        },
        {
            id: 7,
            name: "Carrot Cake",
            description: "Moist spiced carrots, rich creamy frosting.",
            price: 850.00,
            image: require('@/assets/images/premade-cakes/carrot.png')
        },
    ]

    const { cart, addToCart, setAmount } = useCart();
    const [input, setInput] = useState("");
    const router = useRouter();

    const listCakes = cakeData.map((cake, index) => <CakeOrderCard key={index} id={cake.id} price={cake.price} image={cake.image} name={cake.name} description={cake.description} addedToCart={cart.some((prod) => prod.id === cake.id)} addToCart={addToCart} amount={cart.find((prod) => prod.id === cake.id)?.amount || 0} onSetAmount={setAmount} />)

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <ScrollView>
                <View className='flex-1'>
                    <View className='w-full flex-row justify-between items-center mt-6 px-6'>
                        <TouchableOpacity onPress={() => router.back()}><ArrowLeft style={{ color: '#8B5A3C' }} /></TouchableOpacity>
                        <Text className='text-2xl font-semibold text-primary'>Cakes</Text>
                        <View className='w-8' />
                    </View>

                    <View className='px-2 py-1.5 mt-2 border-y border-y-gray-300 flex-row gap-2 items-center'>
                        <Search style={{ opacity: 0.5 }} />
                        <TextInput className='text-lg' value={input} onChangeText={setInput} placeholder='Search for cake' />
                    </View>

                    <Text className='text-2xl font-extrabold px-2 py-4'>Pre-made Cakes</Text>

                    <View className='w-full p-2'>
                        {listCakes}
                    </View>
                </View>
            </ScrollView>
            {cart.length > 0 &&
                <View className='w-full h-40 p-6 bg-white border border-secondary-light'>
                    <TouchableOpacity className='w-full bg-secondary-light rounded-full flex-row items-center gap-4 p-4' onPress={() => router.push('/checkout')}>
                        <View className='bg-white rounded-full h-8 w-8 items-center justify-center'>
                            <Text className='font-bold text-secondary-strong'>{cart.length}</Text>
                        </View>
                        <Text className='font-bold text-lg text-white'>View Order Details</Text>
                    </TouchableOpacity>
                </View>
            }
        </SafeAreaView>
    )
}

export default CakeOrders