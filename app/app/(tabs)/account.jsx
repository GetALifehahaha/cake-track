import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

const Account = () => {

  const { logout } = useContext(AuthContext);

  return (
    <View className='flex-1 justify-center items-center'>
      <TouchableOpacity className='p-2 rounded-md bg-secondary-strong' onPress={logout}>
        <Text className='text-white font-semibold'>
          LOGOUT LOL
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Account