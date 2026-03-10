import './global.css';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useCallback, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Plus, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import LocationApi from '@/api/LocationApi';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const LocationPicker = () => {
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const { currentAddress, returnTo } = useLocalSearchParams();

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const data = await LocationApi.getAll();
            const list = data.results || data;
            setLocations(list);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
            showToast('Failed to load locations', 'error');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchLocations();
            }
        }, [user])
    );

    const formatAddress = (loc) => {
        const parts = [loc.street, loc.barangay, loc.province, loc.zip_code].filter(Boolean);
        return parts.join(', ') || 'No address details';
    };

    const handleSelect = (loc) => {
        const fullAddress = formatAddress(loc);
        // Navigate back to the originating page with the selected address
        if (returnTo) {
            router.navigate({ pathname: returnTo, params: { selectedAddress: fullAddress } });
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='w-full flex-row justify-between items-center mt-6 px-6 pb-4 border-b border-b-gray-200'>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
                <Text className='text-2xl font-semibold text-primary'>Select Location</Text>
                <TouchableOpacity onPress={() => router.push('/locationForm')}>
                    <Plus style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className='flex-1 justify-center items-center'>
                    <ActivityIndicator size="large" color="#8B5A3C" />
                </View>
            ) : (
                <ScrollView className='flex-1 px-4 pt-4'>
                    {locations.length === 0 ? (
                        <View className='flex-1 justify-center items-center mt-20'>
                            <MapPin size={48} style={{ color: '#d1d5db' }} />
                            <Text className='text-gray-400 text-lg mt-4'>No saved locations</Text>
                            <Text className='text-gray-400 text-sm mt-1'>Add a location to quickly fill your address</Text>
                            <TouchableOpacity
                                className='mt-6 bg-secondary-light px-6 py-3 rounded-full'
                                onPress={() => router.push('/locationForm')}
                            >
                                <Text className='text-white font-bold'>Add Location</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        locations.map((loc) => {
                            const fullAddress = formatAddress(loc);
                            const isSelected = currentAddress === fullAddress;

                            return (
                                <TouchableOpacity
                                    key={loc.id}
                                    className={`border rounded-xl p-4 mb-3 flex-row items-center gap-3 ${isSelected ? 'border-primary bg-secondary-light/10' : 'border-gray-200 bg-white'}`}
                                    onPress={() => handleSelect(loc)}
                                >
                                    <View className={`p-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-secondary-light/20'}`}>
                                        {isSelected ? (
                                            <Check size={20} style={{ color: 'white' }} />
                                        ) : (
                                            <MapPin size={20} style={{ color: '#8B5A3C' }} />
                                        )}
                                    </View>
                                    <View className='flex-1'>
                                        <Text className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-gray-800'}`} numberOfLines={1}>
                                            {loc.description || 'Unnamed Location'}
                                        </Text>
                                        <Text className='text-gray-500 mt-0.5' numberOfLines={2}>
                                            {fullAddress}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View className='h-6' />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default LocationPicker;
