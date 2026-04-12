import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Check,
  X,
  TriangleAlert,
} from 'lucide-react-native';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/api/api';
import GlobalRefreshScrollView from '@/components/organisms/GlobalRefreshScrollView';
import { formatPhoneNumber, isValidEmail, isValidPHPhoneNumber, normalizePhoneNumber } from '@/utils/validators';

const EditProfile = () => {
  const texture = require('@/assets/images/texture/Cake back Designs Cakes area or any2.jpg');

  const { user, getUserData, logout } = useContext(AuthContext);
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivationConfirmation, setDeactivationConfirmation] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    setFirstName(user?.first_name || '');
    setMiddleName(user?.middle_name || '');
    setLastName(user?.last_name || '');
    setEmail(user?.email || '');
    setPhoneNumber(formatPhoneNumber(user?.phone_number || ''));
  }, [user?.first_name, user?.middle_name, user?.last_name, user?.email, user?.phone_number]);

  const displayName = useMemo(() => {
    const parts = [firstName, middleName, lastName]
      .map((part) => String(part || '').trim())
      .filter(Boolean);

    if (parts.length === 0) return user?.username || '';
    return parts.join(' ');
  }, [firstName, middleName, lastName, user?.username]);

  const handlePhoneChange = (text) => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  const handleCancel = () => {
    setFirstName(user?.first_name || '');
    setMiddleName(user?.middle_name || '');
    setLastName(user?.last_name || '');
    setEmail(user?.email || '');
    setPhoneNumber(formatPhoneNumber(user?.phone_number || ''));
    router.back();
  };

  const handleSave = async () => {
    if (!firstName.trim() || !middleName.trim() || !lastName.trim()) {
      showToast('First name, middle name, and last name are required', 'error');
      return;
    }

    if (!email.trim()) {
      showToast('Email is required', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!phoneNumber.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }

    if (!isValidPHPhoneNumber(phoneNumber)) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/me/', {
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: normalizePhoneNumber(phoneNumber),
      });

      await getUserData();
      showToast('Profile updated successfully', 'success');
      router.back();
    } catch (error) {
      const errorPayload = error?.response?.data;
      const firstError = Object.values(errorPayload || {})?.[0];

      if (Array.isArray(firstError) && firstError[0]) {
        showToast(firstError[0], 'error');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const openDeactivateModal = () => {
    setDeactivationConfirmation('');
    setShowDeactivateModal(true);
  };

  const handleDeactivate = async () => {
    const username = user?.username;
    if (!username) {
      showToast('Unable to deactivate account right now', 'error');
      return;
    }

    const expectedText = `disable ${username}`;
    if (deactivationConfirmation.trim() !== expectedText) {
      showToast(`Please type exactly: ${expectedText}`, 'error');
      return;
    }

    setDeactivating(true);
    try {
      await api.post('/users/user/deactivate/', {
        confirmation: deactivationConfirmation.trim(),
      });

      setShowDeactivateModal(false);
      showToast('Your account has been deactivated', 'success');
      await logout();
    } catch (error) {
      const message = error?.response?.data?.detail || 'Failed to deactivate account';
      showToast(message, 'error');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <ImageBackground source={texture} style={{ flex: 1 }} resizeMode='repeat'>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className='flex-1' style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <View className='px-5 pt-6 pb-2 flex-row items-center gap-3'>
          <TouchableOpacity
            className='h-10 w-10 rounded-full bg-white border border-gray-200 items-center justify-center'
            onPress={() => router.back()}
          >
            <ChevronLeft size={20} color='#4B5563' />
          </TouchableOpacity>

          <View className='flex-1'>
            <Text className='text-2xl font-extrabold text-primary'>Edit Profile</Text>
            <Text className='text-sm text-secondary-light'>Update your account details</Text>
          </View>
        </View>

        <GlobalRefreshScrollView className='flex-1' bounces={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View className='px-5 mt-3'>
            <View className='rounded-2xl border border-gray-200 bg-white p-5 mb-4'>
              <View className='items-center mb-4'>
                <View className='h-16 w-16 rounded-full bg-[#F2E3D3] items-center justify-center'>
                  <User size={32} color='#8B5A3C' />
                </View>
                <Text className='text-xl font-bold text-[#2E241C] mt-3 text-center'>{displayName || 'Your Name'}</Text>
                <Text className='text-xs text-secondary-light mt-1'>Username: {user?.username || '-'}</Text>
              </View>

              <View className='gap-3'>
                <View>
                  <Text className='text-xs font-semibold text-gray-500 mb-1.5'>First Name</Text>
                  <TextInput
                    className='py-3 px-3 rounded-lg border border-secondary-light bg-white text-black'
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder='First Name'
                    placeholderTextColor='#9ca3af'
                  />
                </View>

                <View>
                  <Text className='text-xs font-semibold text-gray-500 mb-1.5'>Middle Name</Text>
                  <TextInput
                    className='py-3 px-3 rounded-lg border border-secondary-light bg-white text-black'
                    value={middleName}
                    onChangeText={setMiddleName}
                    placeholder='Middle Name'
                    placeholderTextColor='#9ca3af'
                  />
                </View>

                <View>
                  <Text className='text-xs font-semibold text-gray-500 mb-1.5'>Last Name</Text>
                  <TextInput
                    className='py-3 px-3 rounded-lg border border-secondary-light bg-white text-black'
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder='Last Name'
                    placeholderTextColor='#9ca3af'
                  />
                </View>

                <View>
                  <Text className='text-xs font-semibold text-gray-500 mb-1.5'>Email</Text>
                  <View className='py-0.5 px-3 rounded-lg border border-secondary-light bg-white flex-row items-center gap-2'>
                    <Mail size={16} color='#8B5A3C' />
                    <TextInput
                      className='flex-1 py-2.5 text-black'
                      value={email}
                      onChangeText={setEmail}
                      placeholder='Email'
                      placeholderTextColor='#9ca3af'
                      keyboardType='email-address'
                      autoCapitalize='none'
                    />
                  </View>
                </View>

                <View>
                  <Text className='text-xs font-semibold text-gray-500 mb-1.5'>Phone Number</Text>
                  <View className='py-0.5 px-3 rounded-lg border border-secondary-light bg-white flex-row items-center gap-2'>
                    <Phone size={16} color='#8B5A3C' />
                    <TextInput
                      className='flex-1 py-2.5 text-black'
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      placeholder='0912 345 6789'
                      placeholderTextColor='#9ca3af'
                      keyboardType='number-pad'
                      maxLength={13}
                    />
                  </View>
                </View>
              </View>

              <View className='flex-row gap-3 mt-5'>
                <TouchableOpacity
                  className='flex-1 flex-row gap-2 items-center justify-center p-3 rounded-lg border border-gray-300'
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <X size={16} color='#6b7280' />
                  <Text className='font-bold text-gray-600'>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className='flex-1 flex-row gap-2 items-center justify-center p-3 rounded-lg bg-primary'
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size='small' color='white' />
                  ) : (
                    <>
                      <Check size={16} color='white' />
                      <Text className='font-bold text-white'>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className='rounded-2xl border border-red-200 bg-red-50 p-5 mb-4'>
              <View className='flex-row items-center gap-2'>
                <TriangleAlert size={16} color='#B91C1C' />
                <Text className='text-red-700 font-bold'>Deactivate Account</Text>
              </View>

              <Text className='text-red-700/80 text-sm mt-2 leading-5'>
                This will immediately deactivate your account. You can reactivate it within 60 days by logging in and confirming reactivation.
              </Text>

              <TouchableOpacity
                className='mt-4 w-full rounded-xl border border-red-300 bg-white px-4 py-3 items-center justify-center'
                onPress={openDeactivateModal}
              >
                <Text className='text-red-600 font-bold'>Deactivate Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlobalRefreshScrollView>
      </SafeAreaView>

      <Modal
        visible={showDeactivateModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowDeactivateModal(false)}
      >
        <View className='flex-1 items-center justify-center bg-black/50 px-6'>
          <View className='w-full max-w-[420px] rounded-2xl border border-gray-200 bg-white p-5'>
            <Text className='text-lg font-bold text-primary'>Deactivate Account</Text>
            <Text className='mt-2 text-gray-700'>
              Your account will be deactivated immediately. You can reactivate it within 60 days by logging in and confirming reactivation.
            </Text>
            <Text className='mt-3 text-xs text-gray-600'>
              Type disable {user?.username} to confirm.
            </Text>

            <TextInput
              className='mt-2 rounded-lg border border-gray-300 px-3 py-3 text-black'
              placeholder={`disable ${user?.username || ''}`}
              placeholderTextColor='#9ca3af'
              autoCapitalize='none'
              value={deactivationConfirmation}
              onChangeText={setDeactivationConfirmation}
            />

            <View className='mt-4 flex-row gap-3'>
              <TouchableOpacity
                className='flex-1 items-center justify-center rounded-lg border border-gray-300 py-3'
                onPress={() => setShowDeactivateModal(false)}
                disabled={deactivating}
              >
                <Text className='font-semibold text-gray-700'>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='flex-1 items-center justify-center rounded-lg bg-red-600 py-3'
                onPress={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? (
                  <ActivityIndicator size='small' color='white' />
                ) : (
                  <Text className='font-semibold text-white'>Deactivate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default EditProfile;
