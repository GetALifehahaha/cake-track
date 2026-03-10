import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LogOut, Mail, User, MapPin } from 'lucide-react-native'
import ConfirmModal from '@/components/organisms/ConfirmModal'

const Account = () => {

  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView className='flex-1 bg-white'>
        {/* 1. THE HEADER (Parent) */}
        {/* Added z-0 to ensure it sits behind the card if needed, though DOM order usually handles it */}
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

        {/* 2. THE FLOATING CARD (Sibling) */}
        {/* - Removed absolute positioning.
      - Added '-mt-16' (negative margin top) to pull it UP over the header.
      - Added 'self-center' to handle the horizontal centering automatically.
  */}
        <View className='-mt-12 self-center w-[80vw] p-6 bg-white border border-gray-300 justify-center items-center shadow-md rounded-2xl z-10'>
          {user ? 
          <>
            <View className='bg-secondary-light p-4 rounded-full'>
              <User size={60} color="black" />
            </View>
            <Text className='text-2xl font-bold mt-4'>
              {user?.first_name} {user?.last_name}
            </Text>
            <View className='flex-row items-center mt-2 gap-2'>
              <Mail size={14} color="#8B5A3C" />
              <Text className='text-lg font-bold text-primary'>
                {user?.email}
              </Text>
            </View>

            <TouchableOpacity
              className='mt-6 w-full bg-secondary-light/10 border border-secondary-light/30 flex-row gap-3 items-center p-3 rounded-xl'
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
    </SafeAreaView>
  )
}

export default Account