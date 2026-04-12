import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, MapPin, Phone, WalletCards, Copy, CircleHelp, FileText, ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import GlobalRefreshScrollView from '@/components/organisms/GlobalRefreshScrollView';
import api from '@/api/api';

const formatPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

const maskName = (value) => {
    const clean = String(value || '').trim();
    if (!clean) return 'Not available';

    const [first = '', last = ''] = clean.split(/\s+/);
    if (first.length <= 2) return clean;

    const maskedFirst = `${first[0]}${'*'.repeat(Math.max(1, first.length - 2))}${first[first.length - 1]}`;
    return `${maskedFirst}${last ? ` ${last[0]}.` : ''}`;
};

const detailValue = (value, fallback = 'Not set') => {
    const text = String(value || '').trim();
    return text || fallback;
};

const InfoTab = () => {
    const infoTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');

    const [loading, setLoading] = useState(true);
    const [showGcashPreview, setShowGcashPreview] = useState(false);
    const [businessDetails, setBusinessDetails] = useState({
        business_name: '',
        address: '',
        contact_number: '',
        gcash_owner_name: '',
        gcash_owner_number: '',
    });

    const fetchBusinessDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get('/pos/business-details/');
            const payload = response?.data || {};

            setBusinessDetails({
                business_name: payload?.business_name || '',
                address: payload?.address || '',
                contact_number: payload?.contact_number || '',
                gcash_owner_name: payload?.gcash_owner_name || '',
                gcash_owner_number: payload?.gcash_owner_number || '',
            });
        } catch (error) {
            console.error('Failed to load business details:', error?.response?.data || error?.message || error);
            setBusinessDetails({
                business_name: '',
                address: '',
                contact_number: '',
                gcash_owner_name: '',
                gcash_owner_number: '',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessDetails();
    }, []);

    const links = useMemo(() => ([
        { title: 'FAQ', subtitle: 'Common ordering questions', icon: CircleHelp, route: '/faq' },
        { title: 'Terms of Service', subtitle: 'Service rules and usage', icon: FileText, route: '/termsOfService' },
        { title: 'Terms and Conditions', subtitle: 'Full order and policy terms', icon: FileText, route: '/termsAndConditions' },
        { title: 'Privacy Policy', subtitle: 'How your data is handled', icon: ShieldCheck, route: '/privacyPolicy' },
    ]), []);

    const gcashNumberRaw = String(businessDetails.gcash_owner_number || '').replace(/\D/g, '').slice(0, 11);
    const gcashNumberFormatted = formatPhone(gcashNumberRaw);

    const copyGcashNumber = async () => {
        if (!gcashNumberRaw) return;
        await Clipboard.setStringAsync(gcashNumberRaw);
    };

    return (
        <ImageBackground source={infoTexture} style={{ flex: 1 }} resizeMode='repeat'>
            <SafeAreaView className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <GlobalRefreshScrollView onRefresh={fetchBusinessDetails} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View className='px-6 pt-6 pb-3'>
                        <Text className='text-3xl font-extrabold text-primary'>Business Info</Text>
                        <Text className='text-sm text-secondary-light mt-1'>Store details, payment info, and customer policies.</Text>
                    </View>

                    {loading ? (
                        <View className='py-20 items-center justify-center'>
                            <ActivityIndicator size='large' color='#8B5A3C' />
                        </View>
                    ) : (
                        <>
                            <View className='px-6'>
                                <View className='rounded-2xl border border-[#E7D8C8] bg-white px-4 py-4 mb-3'>
                                    <View className='flex-row items-center gap-3 mb-2'>
                                        <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                            <Building2 size={18} color='#8B5A3C' />
                                        </View>
                                        <Text className='text-xs uppercase tracking-wide text-[#8B5A3C] font-bold'>Business Name</Text>
                                    </View>
                                    <Text className='text-lg text-[#3B3024] font-bold'>{detailValue(businessDetails.business_name, 'Michelle\'s Cake & Cafe')}</Text>
                                </View>

                                <View className='rounded-2xl border border-[#E7D8C8] bg-white px-4 py-4 mb-3'>
                                    <View className='flex-row items-center gap-3 mb-2'>
                                        <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                            <MapPin size={18} color='#8B5A3C' />
                                        </View>
                                        <Text className='text-xs uppercase tracking-wide text-[#8B5A3C] font-bold'>Address</Text>
                                    </View>
                                    <Text className='text-base text-[#3B3024] leading-6'>{detailValue(businessDetails.address, 'Address not available')}</Text>
                                </View>

                                <View className='rounded-2xl border border-[#E7D8C8] bg-white px-4 py-4 mb-5'>
                                    <View className='flex-row items-center gap-3 mb-2'>
                                        <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                            <Phone size={18} color='#8B5A3C' />
                                        </View>
                                        <Text className='text-xs uppercase tracking-wide text-[#8B5A3C] font-bold'>Contact Number</Text>
                                    </View>
                                    <Text className='text-base text-[#3B3024] font-semibold'>{detailValue(formatPhone(businessDetails.contact_number), 'Not available')}</Text>
                                </View>

                                <TouchableOpacity
                                    className='mb-6 rounded-xl bg-[#8B5A3C] px-4 py-4 flex-row items-center justify-center gap-2'
                                    activeOpacity={0.9}
                                    onPress={() => setShowGcashPreview(true)}
                                >
                                    <WalletCards size={18} color='white' />
                                    <Text className='text-white font-bold text-base'>Show GCash Preview</Text>
                                </TouchableOpacity>
                            </View>

                            <View className='px-6 pb-6'>
                                <Text className='text-primary font-extrabold text-lg mb-3'>Help and Policies</Text>
                                <View className='gap-3'>
                                    {links.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <TouchableOpacity
                                                key={item.title}
                                                className='rounded-2xl border border-[#E7D8C8] bg-white px-4 py-4 flex-row items-center gap-3'
                                                activeOpacity={0.9}
                                                onPress={() => router.push(item.route)}
                                            >
                                                <View className='h-10 w-10 rounded-full bg-[#F2E3D3] items-center justify-center'>
                                                    <Icon size={18} color='#8B5A3C' />
                                                </View>
                                                <View className='flex-1'>
                                                    <Text className='text-primary text-base font-bold'>{item.title}</Text>
                                                    <Text className='text-secondary-light text-xs'>{item.subtitle}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </>
                    )}
                </GlobalRefreshScrollView>
            </SafeAreaView>

            <Modal
                visible={showGcashPreview}
                transparent
                animationType='fade'
                onRequestClose={() => setShowGcashPreview(false)}
            >
                <View className='flex-1 bg-black/45 items-center justify-center px-6'>
                    <View className='w-full rounded-2xl bg-white border border-[#E7D8C8] p-5'>
                        <Text className='text-primary text-xl font-extrabold mb-1'>GCash Preview</Text>
                        <Text className='text-secondary-light text-xs mb-4'>Use this account for customer payments.</Text>

                        <View className='rounded-xl bg-[#FFF7EA] border border-[#E6BE86] px-4 py-4'>
                            <Text className='text-[11px] text-[#8B5A3C] uppercase font-bold mb-1'>Account Name</Text>
                            <Text className='text-[#3E2D1E] text-lg font-bold mb-3'>{maskName(businessDetails.gcash_owner_name)}</Text>

                            <Text className='text-[11px] text-[#8B5A3C] uppercase font-bold mb-1'>Account Number</Text>
                            <Text className='text-[#3E2D1E] text-base font-bold'>{detailValue(gcashNumberFormatted, 'Not available')}</Text>
                        </View>

                        <View className='mt-4 flex-row gap-3'>
                            <TouchableOpacity
                                className='flex-1 rounded-lg border border-[#D2B89B] py-3 items-center justify-center flex-row gap-2'
                                onPress={copyGcashNumber}
                                disabled={!gcashNumberRaw}
                            >
                                <Copy size={16} color='#8B5A3C' />
                                <Text className='text-[#8B5A3C] font-semibold'>Copy Number</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className='flex-1 rounded-lg bg-[#8B5A3C] py-3 items-center justify-center'
                                onPress={() => setShowGcashPreview(false)}
                            >
                                <Text className='text-white font-semibold'>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
};

export default InfoTab;
