import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Building2, MapPin, Phone, Clock3, WalletCards } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '@/api/api';
import GlobalRefreshScrollView from '@/components/organisms/GlobalRefreshScrollView';
import CakeTraceLoader from '@/components/atoms/CakeTraceLoader';

const formatPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

const formatTimeLabel = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return 'Not set';

    const [hourStr, minuteStr = '00'] = raw.split(':');
    const hourNum = Number(hourStr);
    const minuteNum = Number(minuteStr);

    if (!Number.isFinite(hourNum) || !Number.isFinite(minuteNum)) {
        return raw;
    }

    const period = hourNum >= 12 ? 'PM' : 'AM';
    const normalizedHour = hourNum % 12 || 12;
    return `${normalizedHour}:${String(minuteNum).padStart(2, '0')} ${period}`;
};

const formatOpenDays = (value) => {
    if (!Array.isArray(value) || value.length === 0) return 'Not set';
    return value.join(', ');
};

const detailValue = (value, fallback = 'Not set') => {
    const text = String(value || '').trim();
    return text || fallback;
};

const BusinessInformation = () => {
    const router = useRouter();
    const businessTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');

    const [loadingBusiness, setLoadingBusiness] = useState(true);
    const [hasFinishedInitialLoad, setHasFinishedInitialLoad] = useState(false);
    const [businessDetails, setBusinessDetails] = useState({
        business_name: '',
        address: '',
        contact_number: '',
        gcash_owner_name: '',
        gcash_owner_number: '',
    });
    const [openingTime, setOpeningTime] = useState({
        start_time: '',
        end_time: '',
        open_days: [],
    });

    const fetchBusinessAndSchedule = useCallback(async () => {
        setLoadingBusiness(true);
        try {
            const [businessResponse, openingResponse] = await Promise.all([
                api.get('/pos/business-details/'),
                api.get('/orders/opening-time/'),
            ]);

            const businessPayload = businessResponse?.data || {};
            const openingPayload = openingResponse?.data || {};

            setBusinessDetails({
                business_name: businessPayload?.business_name || '',
                address: businessPayload?.address || '',
                contact_number: businessPayload?.contact_number || '',
                gcash_owner_name: businessPayload?.gcash_owner_name || '',
                gcash_owner_number: businessPayload?.gcash_owner_number || '',
            });

            setOpeningTime({
                start_time: openingPayload?.start_time || '',
                end_time: openingPayload?.end_time || '',
                open_days: Array.isArray(openingPayload?.open_days) ? openingPayload.open_days : [],
            });
        } catch (error) {
            console.error('Failed to load business information:', error?.response?.data || error?.message || error);
            setBusinessDetails({
                business_name: '',
                address: '',
                contact_number: '',
                gcash_owner_name: '',
                gcash_owner_number: '',
            });
            setOpeningTime({ start_time: '', end_time: '', open_days: [] });
        } finally {
            setLoadingBusiness(false);
        }
    }, []);

    useEffect(() => {
        fetchBusinessAndSchedule();
    }, [fetchBusinessAndSchedule]);

    useEffect(() => {
        if (!loadingBusiness) {
            setHasFinishedInitialLoad(true);
        }
    }, [loadingBusiness]);

    const showInitialLoader = !hasFinishedInitialLoad && loadingBusiness;

    if (showInitialLoader) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F2' }}>
                <CakeTraceLoader size={62} trackColor='transparent' />
            </View>
        );
    }

    return (
        <ImageBackground source={businessTexture} style={{ flex: 1 }} resizeMode='repeat'>
            <SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
                <View className='px-6 pt-4 pb-2 flex-row items-center gap-3'>
                    <TouchableOpacity
                        className='h-11 w-11 rounded-full bg-white border border-[#E7D8C8] items-center justify-center'
                        onPress={() => router.back()}
                    >
                        <ArrowLeft color='#8B5A3C' size={20} />
                    </TouchableOpacity>
                    <View>
                        <Text className='text-primary text-xl font-extrabold'>Business Information</Text>
                        <Text className='text-secondary-light text-xs'>Store details and GCash payment account</Text>
                    </View>
                </View>

                <GlobalRefreshScrollView
                    onRefresh={fetchBusinessAndSchedule}
                    contentContainerStyle={{ paddingBottom: 32 }}
                >
                    <View className='px-6 mt-3 gap-4'>
                        {loadingBusiness ? (
                            <View className='py-10 items-center justify-center'>
                                <ActivityIndicator size='small' color='#8B5A3C' />
                            </View>
                        ) : (
                            <>
                                <View className='rounded-2xl border border-[#E7D8C8] bg-white p-5'>
                                    <Text className='text-primary text-lg font-extrabold mb-4'>Store Profile</Text>

                                    <View className='gap-3'>
                                        <View className='rounded-xl border border-[#EFE3D5] bg-[#FFFCF8] px-3.5 py-3 flex-row items-center gap-3'>
                                            <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                                <Building2 size={18} color='#8B5A3C' />
                                            </View>
                                            <View className='flex-1'>
                                                <Text className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>Business Name</Text>
                                                <Text className='text-[#3B3024] font-bold'>{detailValue(businessDetails.business_name, "Michelle's Cake & Cafe")}</Text>
                                            </View>
                                        </View>

                                        <View className='rounded-xl border border-[#EFE3D5] bg-[#FFFCF8] px-3.5 py-3 flex-row items-center gap-3'>
                                            <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                                <MapPin size={18} color='#8B5A3C' />
                                            </View>
                                            <View className='flex-1'>
                                                <Text className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>Address</Text>
                                                <Text className='text-[#3B3024]'>{detailValue(businessDetails.address, 'Address not available')}</Text>
                                            </View>
                                        </View>

                                        <View className='rounded-xl border border-[#EFE3D5] bg-[#FFFCF8] px-3.5 py-3 flex-row items-center gap-3'>
                                            <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                                <Phone size={18} color='#8B5A3C' />
                                            </View>
                                            <View className='flex-1'>
                                                <Text className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>Contact Number</Text>
                                                <Text className='text-[#3B3024] font-semibold'>{detailValue(formatPhone(businessDetails.contact_number), 'Not available')}</Text>
                                            </View>
                                        </View>

                                        <View className='rounded-xl border border-[#EFE3D5] bg-[#FFFCF8] px-3.5 py-3 flex-row items-center gap-3'>
                                            <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                                <Clock3 size={18} color='#8B5A3C' />
                                            </View>
                                            <View className='flex-1'>
                                                <Text className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>Open Days</Text>
                                                <Text className='text-[#3B3024] mb-1'>{formatOpenDays(openingTime.open_days)}</Text>
                                                <Text className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>Open Hours</Text>
                                                <Text className='text-[#3B3024] font-semibold'>{`${formatTimeLabel(openingTime.start_time)} - ${formatTimeLabel(openingTime.end_time)}`}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View className='rounded-2xl border border-[#E6BE86] bg-[#FFF7EA] p-5'>
                                    <View className='flex-row items-center gap-2 mb-3'>
                                        <WalletCards size={18} color='#8B5A3C' />
                                        <Text className='text-[#8B5A3C] text-lg font-extrabold'>GCash Information</Text>
                                    </View>

                                    <View className='rounded-xl border border-[#E6BE86] bg-white px-4 py-3 mb-3'>
                                        <Text className='text-[11px] uppercase tracking-wide text-[#B48B60] font-bold mb-1'>Account Name</Text>
                                        <Text className='text-[#3E2D1E] text-base font-bold'>
                                            {detailValue(businessDetails.gcash_owner_name, 'Not available')}
                                        </Text>
                                    </View>

                                    <View className='rounded-xl border border-[#E6BE86] bg-white px-4 py-3'>
                                        <Text className='text-[11px] uppercase tracking-wide text-[#B48B60] font-bold mb-1'>Account Number</Text>
                                        <Text className='text-[#3E2D1E] text-base font-bold'>
                                            {detailValue(formatPhone(businessDetails.gcash_owner_number), 'Not available')}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </GlobalRefreshScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default BusinessInformation;