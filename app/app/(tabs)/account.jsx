import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LogOut, Mail, User, MapPin, Pencil, X, Check } from 'lucide-react-native'
import ConfirmModal from '@/components/organisms/ConfirmModal'
import api from '@/api/api'

const Account = () => {

  const { user, logout, getUserData } = useContext(AuthContext);
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');

  const startEditing = () => {
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setEmail(user?.email || '');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('First name and last name are required', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/me/', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      await getUserData();
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      const errData = error.response?.data;
      if (errData?.email) {
        showToast(errData.email[0] || 'Email error', 'error');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView className='flex-1' bounces={false}>
        {/* 1. THE HEADER */}
        <View className='h-[160px] bg-primary rounded-b-[20%] p-6 w-full flex-row gap-2 items-center z-0'>
          <Image
            source={require('@/assets/images/logo.jpg')}
            resizeMode="contain"
            className='w-16 h-16 rounded-xl'
          />
          <View>
            <Text className='text-white text-3xl font-bold'>Michelle's Cake & Cafe</Text>
            <View className='flex-row'>
              <Text className='font-bold text-xl text-white'>Cake</Text>
              <Text className='font-bold text-xl text-white ml-2'>Track</Text>
            </View>
          </View>
        </View>

        {/* 2. THE FLOATING CARD */}
        <View className='-mt-12 self-center w-[80vw] p-6 bg-white border border-gray-300 justify-center items-center shadow-md rounded-2xl z-10'>
          {user ? 
          <>
            <View className='bg-secondary-light p-4 rounded-full'>
              <User size={60} color="black" />
            </View>

            {editing ? (
              <>
                {/* Edit Mode */}
                <View className='w-full mt-4 gap-3'>
                  <View>
                    <Text className='text-xs font-bold text-secondary-strong mb-1'>First Name</Text>
                    <TextInput
                      className='py-2 px-3 rounded-lg border border-secondary-light bg-white text-black'
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder='First Name'
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View>
                    <Text className='text-xs font-bold text-secondary-strong mb-1'>Last Name</Text>
                    <TextInput
                      className='py-2 px-3 rounded-lg border border-secondary-light bg-white text-black'
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder='Last Name'
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View>
                    <Text className='text-xs font-bold text-secondary-strong mb-1'>Email</Text>
                    <TextInput
                      className='py-2 px-3 rounded-lg border border-secondary-light bg-white text-black'
                      value={email}
                      onChangeText={setEmail}
                      placeholder='Email'
                      placeholderTextColor="#9ca3af"
                      keyboardType='email-address'
                      autoCapitalize='none'
                    />
                  </View>
                </View>

                {/* Save / Cancel buttons */}
                <View className='flex-row gap-3 mt-4 w-full'>
                  <TouchableOpacity
                    className='flex-1 flex-row gap-2 items-center justify-center p-2.5 rounded-lg border border-gray-300'
                    onPress={cancelEditing}
                    disabled={saving}
                  >
                    <X size={16} color="#6b7280" />
                    <Text className='font-bold text-gray-500'>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className='flex-1 flex-row gap-2 items-center justify-center p-2.5 rounded-lg bg-primary'
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Check size={16} color="white" />
                        <Text className='font-bold text-white'>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Display Mode */}
                <Text className='text-2xl font-bold mt-4'>
                  {user?.first_name} {user?.last_name}
                </Text>
                <View className='flex-row items-center mt-2 gap-2'>
                  <Mail size={14} color="#8B5A3C" />
                  <Text className='text-lg font-bold text-primary' numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity
                  className='mt-4 w-full bg-primary/10 border border-primary/30 flex-row gap-3 items-center p-3 rounded-xl'
                  onPress={startEditing}
                >
                  <View className='bg-primary p-2 rounded-full'>
                    <Pencil size={18} color="white" />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-primary font-bold text-base'>Edit Profile</Text>
                    <Text className='text-secondary-light text-xs'>Update your name and email</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              className='mt-4 w-full bg-secondary-light/10 border border-secondary-light/30 flex-row gap-3 items-center p-3 rounded-xl'
              onPress={() => router.push('/locations')}
            >
              <View className='bg-secondary-light p-2 rounded-full'>
                <MapPin size={18} color="white" />
              </View>
              <View className='flex-1'>
                <Text className='text-primary font-bold text-base'>My Locations</Text>
                <Text className='text-secondary-light text-xs'>Manage your saved addresses</Text>
              </View>
            </TouchableOpacity>

            <ConfirmModal details={"Are you sure you want to logout?"} onConfirm={logout} >
              <View className='mt-8 bg-secondary-strong flex-row gap-2 items-center p-2.5 rounded-lg'>
                <LogOut size={14} color="white"/>
                <Text className='text-lg font-bold text-white'>
                  Logout
                </Text>
              </View>
            </ConfirmModal>
          </>
          :
          <>
            <View className='bg-secondary-light p-4 rounded-full'>
              <User size={60} color="black" />
            </View>
            <Text className='text-2xl font-bold mt-4'>
              Guest User
            </Text>
            <View className='flex-row items-center mt-2 gap-2'>
              <Text className='text-lg font-bold text-primary'>
                Log in to start ordering!
              </Text>
            </View>

            <TouchableOpacity className='mt-8 bg-secondary-strong flex-row gap-2 items-center p-2.5 rounded-lg' onPress={() => router.replace('/login')}>
              <Text className='text-lg font-bold text-white'>
                Login
              </Text>
            </TouchableOpacity>
          </>
          }

        </View>
        <View className='h-8' />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Account