import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import React, { useState, useContext } from 'react'
import { Lock, Mail, Eye, EyeClosed } from 'lucide-react-native'
import { AuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

const LoginSignup = ({ method }) => {

  const { showToast } = useToast();
  const { login, loading } = useContext(AuthContext)
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submitForm = async () => {
    if (method === "login") {
      const res = await login(emailAddress, password)

      if (!res.success) {
        showToast(res.error, "error")
      }
    }
  }

  const router = useRouter();

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5A3C" />
    </View>
  )

  return (
    <SafeAreaView className='flex-1 bg-main-form'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView>
          <View className='w-full items-center my-8  gap-4'>
            <Image className='w-20 h-20 rounded-full' source={require('@/assets/images/logo.jpg')} />
            <Text className='text-xl font-bold text-primary'>
              Michelle's Cakes & Cafe
            </Text>
            <Text className='text-md font-medium text-gray-600'>
              Order your perfect custom cake
            </Text>
          </View>

          <View className='bg-white border border-gray-300 w-[90vw] self-center  rounded-md'>
            <View className='flex-row '>
              <TouchableOpacity className='flex-1 p-6' onPress={() => router.replace('(auth)/login')}>
                <Text className={`text-lg font-medium text-center ${method === "login" ? 'text-secondary-strong' : 'text-gray-300'}`}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className='flex-1 p-6' onPress={() => router.replace('(auth)/signup')}>
                <Text className={`text-lg font-medium text-center ${method === "signup" ? 'text-secondary-strong' : 'text-gray-300'}`}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {method === "login" &&
              <View className='p-6'>
                <Text className='my-8 text-center text-black font-semibold'>
                  Welcome back! Please login to continue
                </Text>
                <View className='flex-row gap-2 items-center'>
                  <Mail style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Email Address</Text>
                </View>
                <TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md' placeholder='dummy_user' value={emailAddress} onChangeText={(text) => setEmailAddress(text)} />
                <View className='flex-row gap-2 items-center'>
                  <Lock style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Password</Text>
                </View>

                <View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
                  <TextInput className='flex-1' placeholder="password_password" secureTextEntry={showPassword}
                    value={password} onChangeText={(text) => setPassword(text)} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye style={{ color: 'gray' }} /> : <EyeClosed style={{ color: 'gray' }} />
                    }
                  </TouchableOpacity>
                </View>

                <TouchableOpacity className='p-4 rounded-md bg-secondary-strong ' onPress={submitForm}>
                  <Text className='text-center font-semibold text-white'>LOGIN</Text>
                </TouchableOpacity>
              </View>
            }
            {method === "signup" &&
              <View className='p-6'>
                <Text className='my-8 text-center text-black font-semibold'>
                  Welcome back! Please login to continue
                </Text>
                <View className='flex-row gap-2 items-center'>
                  <Mail style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Email Address</Text>
                </View>
                <TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md' placeholder='dummy_user' value={emailAddress} onChangeText={(text) => setEmailAddress(text)} />
                <View className='flex-row gap-2 items-center'>
                  <Lock style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Password</Text>
                </View>

                <View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
                  <TextInput className='flex-1' placeholder="password_password" secureTextEntry={showPassword}
                    value={password} onChangeText={(text) => setPassword(text)} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye style={{ color: 'gray' }} /> : <EyeClosed style={{ color: 'gray' }} />
                    }
                  </TouchableOpacity>
                </View>

                <TouchableOpacity className='p-4 rounded-md bg-secondary-strong ' onPress={submitForm}>
                  <Text className='text-center font-semibold text-white'>LOGIN</Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default LoginSignup