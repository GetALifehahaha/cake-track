import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ImageBackground,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Mail,
  MapPin,
  Pencil,
  Building2,
  Phone,
  Clock3,
  WalletCards,
  CircleHelp,
  FileText,
  ShieldCheck,
  LogOut,
} from 'lucide-react-native';
import api from '@/api/api';
import { AuthContext } from '@/context/AuthContext';
import GlobalRefreshScrollView from '@/components/organisms/GlobalRefreshScrollView';
import ActionConfirmModal from '@/components/organisms/ActionConfirmModal';

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

const maskName = (value) => {
  const clean = String(value || '').trim();
  if (!clean) return 'Not available';

  const [first = '', last = ''] = clean.split(/\s+/);
  if (first.length <= 2) return clean;

  const maskedFirst = `${first[0]}${'*'.repeat(Math.max(1, first.length - 2))}${first[first.length - 1]}`;
  return `${maskedFirst}${last ? ` ${last[0]}.` : ''}`;
};

const SettingsTab = () => {
  const settingsTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');
  const { user, logout, getUserData } = useContext(AuthContext);

  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [showGcashPreview, setShowGcashPreview] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

  const policyLinks = useMemo(() => ([
    { title: 'FAQ', subtitle: 'Common ordering questions', icon: CircleHelp, route: '/faq' },
    { title: 'Terms of Service', subtitle: 'Service rules and usage', icon: FileText, route: '/termsOfService' },
    { title: 'Terms and Conditions', subtitle: 'Full order and policy terms', icon: FileText, route: '/termsAndConditions' },
    { title: 'Privacy Policy', subtitle: 'How your data is handled', icon: ShieldCheck, route: '/privacyPolicy' },
  ]), []);

  const accountDisplayName = useMemo(() => {
    const parts = [user?.first_name, user?.middle_name, user?.last_name]
      .map((part) => String(part || '').trim())
      .filter(Boolean);

    if (parts.length === 0) return user?.username || 'Guest User';
    return parts.join(' ');
  }, [user?.first_name, user?.middle_name, user?.last_name, user?.username]);

  const fetchBusinessAndSchedule = async () => {
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
      console.error('Failed to load settings details:', error?.response?.data || error?.message || error);
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
  };

  useEffect(() => {
    fetchBusinessAndSchedule();
  }, []);

  const onRefresh = async () => {
    await Promise.allSettled([
      fetchBusinessAndSchedule(),
      getUserData?.(),
    ]);
  };

  const openLogoutConfirmation = () => {
    if (loggingOut) return;
    setShowLogoutConfirmModal(true);
  };

  const closeLogoutConfirmation = () => {
    if (loggingOut) return;
    setShowLogoutConfirmModal(false);
  };

  const confirmLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirmModal(false);
    }
  };

  const gcashNumberFormatted = formatPhone(businessDetails.gcash_owner_number);

  return (
    <ImageBackground source={settingsTexture} style={{ flex: 1 }} resizeMode='repeat'>
      <SafeAreaView edges={['left', 'right', 'bottom']} className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <GlobalRefreshScrollView className='flex-1' bounces={false} onRefresh={onRefresh} contentContainerStyle={{ paddingBottom: 34 }}>
          <View className='h-[168px] bg-primary rounded-b-[20%] px-6 pt-7 w-full flex-row gap-3 items-center z-0'>
            <Image
              source={require('@/assets/images/logo.jpg')}
              resizeMode='contain'
              className='w-16 h-16 rounded-xl'
            />
            <View className='flex-1'>
              <Text className='text-white text-2xl font-bold'>Michelle's Cake & Cafe</Text>
              <Text className='text-white/90 text-base font-semibold'>CakeTrack Settings</Text>
            </View>
          </View>

          <View className='-mt-12 px-6'>
            <View className='rounded-2xl border border-gray-200 p-5 shadow-md' style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)' }}>
              <Text className='text-primary text-xl font-extrabold mb-4'>Account Overview</Text>

              {user ? (
                <>
                  <View className='items-center'>
                    <View className='bg-secondary-light p-4 rounded-full'>
                      <User size={58} color='black' />
                    </View>
                    <Text className='text-2xl font-bold mt-3 text-center text-[#2E241C]'>{accountDisplayName}</Text>
                    <Text className='text-sm text-secondary-light mt-1'>@{detailValue(user?.username, 'guest')}</Text>
                  </View>

                  <View className='mt-5 gap-3'>
                    <View className='rounded-xl border border-[#EFE3D5] bg-[#FFFAF3] px-3.5 py-3 flex-row items-center gap-3'>
                      <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                        <Mail size={17} color='#8B5A3C' />
                      </View>
                      <View className='flex-1'>
                        <Text className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>Email</Text>
                        <Text className='text-[#3B3024] font-semibold'>{detailValue(user?.email, 'Not available')}</Text>
                      </View>
                    </View>

                    <View className='rounded-xl border border-[#EFE3D5] bg-[#FFFAF3] px-3.5 py-3 flex-row items-center gap-3'>
                      <View className='h-9 w-9 rounded-full bg-[#F2E3D3] items-center justify-center'>
                        <Phone size={17} color='#8B5A3C' />
                      </View>
                      <View className='flex-1'>
                        <Text className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>Phone Number</Text>
                        <Text className='text-[#3B3024] font-semibold'>{detailValue(formatPhone(user?.phone_number), 'Not available')}</Text>
                      </View>
                    </View>
                  </View>

                  <View className='mt-5 flex-row gap-3'>
                    <TouchableOpacity
                      className='flex-1 rounded-xl border border-[#D9C5AD] bg-[#FFF7EA] px-4 py-3.5 flex-row items-center gap-2 justify-center'
                      onPress={() => router.push('/locations')}
                    >
                      <MapPin size={16} color='#8B5A3C' />
                      <Text className='text-[#8B5A3C] font-semibold text-sm'>My Locations</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className='flex-1 rounded-xl bg-primary px-4 py-3.5 flex-row items-center gap-2 justify-center'
                      onPress={() => router.push('/editProfile')}
                    >
                      <Pencil size={16} color='white' />
                      <Text className='text-white font-bold text-sm'>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View className='rounded-xl border border-[#E7D8C8] bg-[#FFF7EA] p-4'>
                  <Text className='text-primary font-bold text-base'>Guest User</Text>
                  <Text className='text-secondary-light text-sm mt-1'>Log in to manage your profile and settings.</Text>
                  <TouchableOpacity
                    className='mt-4 rounded-lg bg-primary px-4 py-3 items-center justify-center'
                    onPress={() => router.replace('/(auth)/login')}
                  >
                    <Text className='text-white font-bold'>Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View className='px-6 mt-5'>
            <View className='rounded-2xl border border-[#E7D8C8] bg-white p-5 mb-5'>
              <Text className='text-primary text-lg font-extrabold mb-4'>Business Information</Text>

              {loadingBusiness ? (
                <View className='py-6 items-center justify-center'>
                  <ActivityIndicator size='small' color='#8B5A3C' />
                </View>
              ) : (
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

                  <TouchableOpacity
                    className='mt-1 rounded-xl bg-[#8B5A3C] px-4 py-3.5 flex-row items-center justify-center gap-2'
                    activeOpacity={0.9}
                    onPress={() => setShowGcashPreview(true)}
                  >
                    <WalletCards size={18} color='white' />
                    <Text className='text-white font-bold'>Show GCash Information</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className='rounded-2xl border border-[#E7D8C8] bg-white p-5 mb-5'>
              <Text className='text-primary text-lg font-extrabold mb-4'>Help and Policies</Text>
              <View className='gap-3'>
                {policyLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      className='rounded-2xl border border-[#E7D8C8] bg-[#FFFCF8] px-4 py-4 flex-row items-center gap-3'
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

            {user && (
              <TouchableOpacity
                className='bg-secondary-strong flex-row gap-2 items-center justify-center p-3.5 rounded-lg'
                onPress={openLogoutConfirmation}
                disabled={loggingOut}
              >
                <LogOut size={16} color='white' />
                <Text className='text-base font-bold text-white'>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
              </TouchableOpacity>
            )}

            <Text className='text-center text-gray-400 text-[11px] mt-5'>CakeTrack 2026</Text>
          </View>
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
            <Text className='text-primary text-xl font-extrabold mb-1'>GCash Information</Text>
            <Text className='text-secondary-light text-xs mb-4'>Use this account for customer payments.</Text>

            <View className='rounded-xl bg-[#FFF7EA] border border-[#E6BE86] px-4 py-4'>
              <Text className='text-[11px] text-[#8B5A3C] uppercase font-bold mb-1'>Account Name</Text>
              <Text className='text-[#3E2D1E] text-lg font-bold mb-3'>{maskName(businessDetails.gcash_owner_name)}</Text>

              <Text className='text-[11px] text-[#8B5A3C] uppercase font-bold mb-1'>Account Number</Text>
              <Text className='text-[#3E2D1E] text-base font-bold'>{detailValue(gcashNumberFormatted, 'Not available')}</Text>
            </View>

            <TouchableOpacity
              className='mt-4 rounded-lg bg-[#8B5A3C] py-3 items-center justify-center'
              onPress={() => setShowGcashPreview(false)}
            >
              <Text className='text-white font-semibold'>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ActionConfirmModal
        visible={showLogoutConfirmModal}
        title='Logout'
        message='Are you sure you want to logout?'
        cancelText='No, Stay Logged In'
        confirmText='Yes, Logout'
        onCancel={closeLogoutConfirmation}
        onConfirm={confirmLogout}
        loading={loggingOut}
      />
    </ImageBackground>
  );
};

export default SettingsTab;
