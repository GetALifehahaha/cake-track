import './global.css';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LocationApi from '@/api/LocationApi';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import FormLabel from '@/components/atoms/FormLabel';

const LocationForm = () => {
    const router = useRouter();
    const { locationId } = useLocalSearchParams();
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();

    const isEditing = !!locationId;

    const [description, setDescription] = useState('');
    const [street, setStreet] = useState('');
    const [barangay, setBarangay] = useState('');
    const [province, setProvince] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            const fetchLocation = async () => {
                try {
                    const data = await LocationApi.getById(locationId);
                    setDescription(data.description || '');
                    setStreet(data.street || '');
                    setBarangay(data.barangay || '');
                    setProvince(data.province || '');
                    setZipCode(data.zip_code || '');
                } catch (error) {
                    console.error('Failed to fetch location:', error);
                    showToast('Failed to load location', 'error');
                    router.back();
                } finally {
                    setFetching(false);
                }
            };
            fetchLocation();
        }
    }, [locationId]);

    const handleSave = async () => {
        if (!description.trim()) {
            showToast('Please enter a label/description for this location', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                description: description.trim(),
                street: street.trim() || null,
                barangay: barangay.trim() || null,
                province: province.trim() || null,
                zip_code: zipCode.trim() || null,
            };

            if (isEditing) {
                await LocationApi.update(locationId, payload);
                showToast('Location updated', 'success');
            } else {
                await LocationApi.create(payload);
                showToast('Location added', 'success');
            }

            router.back();
        } catch (error) {
            console.error('Failed to save location:', error);
            showToast('Failed to save location', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        router.replace('/(auth)/login');
        return null;
    }

    if (fetching) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#8B5A3C" />
            </View>
        );
    }

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View className='w-full flex-row justify-between items-center mt-6 px-6 pb-4 border-b border-b-gray-200'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft style={{ color: '#8B5A3C' }} />
                    </TouchableOpacity>
                    <Text className='text-2xl font-semibold text-primary'>
                        {isEditing ? 'Edit Location' : 'Add Location'}
                    </Text>
                    <View className='w-8' />
                </View>

                <ScrollView className='flex-1 px-6 pt-6' keyboardShouldPersistTaps="handled">
                    <View className='gap-4'>
                        <View>
                            <FormLabel text={"Label / Description *"} />
                            <TextInput
                                className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white'
                                value={description}
                                onChangeText={setDescription}
                                placeholder="e.g. Home, Office, Mom's house"
                            />
                        </View>
                        <View>
                            <FormLabel text={"Street"} />
                            <TextInput
                                className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white'
                                value={street}
                                onChangeText={setStreet}
                                placeholder='123 Main St.'
                            />
                        </View>
                        <View>
                            <FormLabel text={"Barangay"} />
                            <TextInput
                                className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white'
                                value={barangay}
                                onChangeText={setBarangay}
                                placeholder='Barangay San Jose'
                            />
                        </View>
                        <View>
                            <FormLabel text={"Province"} />
                            <TextInput
                                className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white'
                                value={province}
                                onChangeText={setProvince}
                                placeholder='Laguna'
                            />
                        </View>
                        <View>
                            <FormLabel text={"Zip Code"} />
                            <TextInput
                                className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white'
                                value={zipCode}
                                onChangeText={setZipCode}
                                placeholder='4000'
                                keyboardType='numeric'
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className='mt-8 mb-6 bg-secondary-light p-4 rounded-full flex-row items-center justify-center gap-2'
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Save size={18} style={{ color: 'white' }} />
                                <Text className='text-white font-bold text-lg'>
                                    {isEditing ? 'Update Location' : 'Save Location'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LocationForm;
