import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Building2,
  CircleHelp,
  FileText,
  ShieldCheck,
  LogOut,
} from 'lucide-react-native';
import { AuthContext } from '@/context/AuthContext';
import GlobalRefreshScrollView from '@/components/organisms/GlobalRefreshScrollView';
import ActionConfirmModal from '@/components/organisms/ActionConfirmModal';

const formatPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

const detailValue = (value, fallback = 'Not set') => {
  const text = String(value || '').trim();
  return text || fallback;
};

const SettingsTab = () => {
  const settingsTexture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');
  const { user, logout, getUserData } = useContext(AuthContext);

  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const policyLinks = useMemo(() => ([
    { title: 'Business Information', subtitle: 'Store details and payment account', icon: Building2, route: '/businessInformation' },
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

  const onRefresh = async () => {
    await Promise.allSettled([
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
