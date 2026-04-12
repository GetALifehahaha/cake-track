import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useContext, useEffect } from 'react'
import { ArrowLeft, Search } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import CakeOrderCard from '@/components/molecules/CakeOrderCard'
import { useCart } from '@/context/CartContext'
import { AuthContext } from '@/context/AuthContext'
import api from '@/api/api'

const CakeOrders = () => {

    const { user, loading: userLoading } = useContext(AuthContext);
    const router = useRouter();

    const [cakes, setCakes] = useState([]);
    const [bestSellerCakeId, setBestSellerCakeId] = useState(null);
    const [fetchingCakes, setFetchingCakes] = useState(true);
    const { cart, addToCart, setAmount } = useCart();
    const [input, setInput] = useState("");

    useEffect(() => {
        const fetchCakes = async () => {
            try {
                const response = await api.get('/orders/cakes/', {
                    params: { ordering: '-times_ordered,name' }
                });
                const data = response.data.results || response.data;
                setCakes(data);
                setBestSellerCakeId(data?.[0]?.id ?? null);
            } catch (error) {
                console.error("Failed to fetch cakes:", error);
            } finally {
                setFetchingCakes(false);
            }
        }
        fetchCakes();
    }, []);


    if (userLoading || fetchingCakes) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5A3C" />
        </View>
    )

    if (!user) {
        router.replace('/(auth)/login');
        return null;
    }

    const filteredCakes = cakes.filter(cake => 
        cake.name.toLowerCase().includes(input.toLowerCase())
    );

    const cakeRankById = new Map(cakes.map((cake, index) => [cake.id, index + 1]));

    const listCakes = filteredCakes.map((cake) => (
        <CakeOrderCard 
            key={cake.id} 
            id={cake.id} 
            price={cake.price} 
            image={{ uri: cake.image }} 
            name={cake.name} 
            baseFlavor={cake.base_flavor}
            description={""} 
            isBestSeller={cake.id === bestSellerCakeId}
            rank={cakeRankById.get(cake.id)}
            orderedCount={cake.times_ordered || 0}
            addedToCart={cart.some((prod) => prod.id === cake.id)} 
            addToCart={addToCart} 
            amount={cart.find((prod) => prod.id === cake.id)?.amount || 0} 
            onSetAmount={setAmount} 
        />
    ));

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
                        <TextInput className='text-lg w-full' value={input} onChangeText={setInput} placeholder='Search for cake' />
                    </View>

                    <Text className='text-2xl font-extrabold px-2 pt-4'>Pre-made Cakes</Text>
                    <Text className='text-sm px-2 pb-2 text-secondary-light'>Sorted by best-selling cakes</Text>

                    <View className='w-full p-2'>
                        {listCakes.length > 0 ? listCakes : (
                            <Text className="text-center text-gray-500 mt-4">No cakes found.</Text>
                        )}
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