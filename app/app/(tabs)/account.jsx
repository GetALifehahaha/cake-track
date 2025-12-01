import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { router } from 'expo-router'

const Account = () => {

  const { logout } = useContext(AuthContext);

  return (
    <View className='flex-1 justify-center items-center'>
      <TouchableOpacity className='p-2 rounded-md bg-secondary-strong' onPress={logout}>
        <Text className='text-white font-semibold'>
          LOGOUT LOL
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className='p-2 rounded-md bg-secondary-strong' onPress={() => router.push('/orderSuccess')}>
        <Text className='text-white font-semibold'>
          Test Success
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Account