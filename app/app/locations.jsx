import './global.css';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, MapPin, Pencil, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import LocationApi from '@/api/LocationApi';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/organisms/ConfirmModal';

const Locations = () => {
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
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

    // Refetch locations every time the screen is focused
    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchLocations();
            }
        }, [user])
    );

    const handleDelete = async (id) => {
        try {
            await LocationApi.delete(id);
            setLocations((prev) => prev.filter((loc) => loc.id !== id));
            showToast('Location deleted', 'success');
        } catch (error) {
            console.error('Failed to delete location:', error);
            showToast('Failed to delete location', 'error');
        }
    };

    const formatAddress = (loc) => {
        const parts = [loc.street, loc.barangay, loc.province, loc.zip_code].filter(Boolean);
        return parts.join(', ') || 'No address details';
    };

    if (!user) {
        router.replace('/(auth)/login');
        return null;
    }

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='w-full flex-row justify-between items-center mt-6 px-6 pb-4 border-b border-b-gray-200'>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft style={{ color: '#8B5A3C' }} />
                </TouchableOpacity>
                <Text className='text-2xl font-semibold text-primary'>My Locations</Text>
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
                            <TouchableOpacity
                                className='mt-6 bg-secondary-light px-6 py-3 rounded-full'
                                onPress={() => router.push('/locationForm')}
                            >
                                <Text className='text-white font-bold'>Add Location</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        locations.map((loc) => (
                            <View
                                key={loc.id}
                                className='bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm'
                            >
                                <View className='flex-row items-start gap-3'>
                                    <View className='bg-secondary-light/20 p-2 rounded-full mt-1'>
                                        <MapPin size={20} style={{ color: '#8B5A3C' }} />
                                    </View>
                                    <View className='flex-1'>
                                        <Text className='text-primary font-bold text-lg' numberOfLines={1}>
                                            {loc.description || 'Unnamed Location'}
                                        </Text>
                                        <Text className='text-gray-500 mt-1' numberOfLines={2}>
                                            {formatAddress(loc)}
                                        </Text>
                                    </View>
                                </View>

                                <View className='flex-row justify-end gap-4 mt-3 pt-3 border-t border-gray-100'>
                                    <TouchableOpacity
                                        className='flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100'
                                        onPress={() => router.push({ pathname: '/locationForm', params: { locationId: loc.id } })}
                                    >
                                        <Pencil size={14} style={{ color: '#8B5A3C' }} />
                                        <Text className='text-primary font-medium text-sm'>Edit</Text>
                                    </TouchableOpacity>

                                    <ConfirmModal
                                        details={`Delete "${loc.description || 'this location'}"? This action cannot be undone.`}
                                        onConfirm={() => handleDelete(loc.id)}
                                    >
                                        <View className='flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50'>
                                            <Trash2 size={14} style={{ color: '#ef4444' }} />
                                            <Text className='text-red-500 font-medium text-sm'>Delete</Text>
                                        </View>
                                    </ConfirmModal>
                                </View>
                            </View>
                        ))
                    )}
                    <View className='h-6' />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default Locations;
