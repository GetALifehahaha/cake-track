import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router' 
import React, { useState, useContext } from 'react'
import { Lock, Mail, Eye, EyeClosed, User2Icon } from 'lucide-react-native'
import { AuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

const LoginSignup = ({ method }) => {
  const { showToast } = useToast();
  const { login, loading, register } = useContext(AuthContext)
  
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup specific
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submitForm = async () => {
    if (method === "login") {
      const res = await login(username, password) 
      if (!res.success) {
        showToast(res.error || "Login failed", "error")
      } else if (res.success) {
        showToast("Logged in successfully!", "success");
        router.replace('/(tabs)/'); 
      }
    } else if (method === "signup") {
      if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
      } 
      const res = await register(username, password, firstName, lastName, emailAddress);
      if (!res.success) {
        showToast(res.error || "Signup failed", "error")
      } else if (res.success) {
        showToast("Account created successfully! Please login.", "success");
        router.replace('(auth)/login');
      }
    }
  }

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5A3C" />
    </View>
  )

  return (
    // 1. SAFE AREA: Keep as top level
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      
      {/* 2. KEYBOARD AVOIDING VIEW */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // iOS needs 'padding', Android usually works better with 'height' or undefined
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        // 3. CRITICAL FIX: Increase offset to clear status bars/headers
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        
        {/* 4. SCROLLVIEW: Must have flex: 1 to shrink correctly */}
        <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
          <View className='w-full items-center my-8 gap-4'>
              <Image className='w-20 h-20 rounded-full' source={require('@/assets/images/logo.jpg')} />
              <TouchableOpacity className='absolute top-4 right-4 p-4 rounded-m w-fit mx-auto mb-4' onPress={() => router.replace('(tabs)/')}>
                <Text className='text-center font-semibold text-secondary-light'>BACK</Text>
              </TouchableOpacity>
            <Text className='text-xl font-bold text-primary'>
              Michelle's Cakes & Cafe
            </Text>
            <Text className='text-md font-medium text-gray-600'>
              Order your perfect custom cake
            </Text>
          </View>

          <View className='bg-white border border-gray-300 w-[90vw] self-center rounded-2xl mb-10'>
            {/* Tabs */}
            <View className='flex-row border-b border-gray-500'>
               <TouchableOpacity className={`flex-1 p-6 ${method === "login" ? 'border-b-2 border-secondary-light' : ''}`} onPress={() => router.replace('(auth)/login')}>
               <Text className={`text-lg font-medium text-center ${method === "login" ? 'text-secondary-strong' : 'text-gray-300'}`}>
                 Login
               </Text>
              </TouchableOpacity>
              <TouchableOpacity className={`flex-1 p-6 ${method === "signup" ? 'border-b-2 border-secondary-light' : ''}`} onPress={() => router.replace('(auth)/signup')}>
              <Text className={`text-lg font-medium text-center ${method === "signup" ? 'text-secondary-strong' : 'text-gray-300'}`}>
                 Sign Up
               </Text>
              </TouchableOpacity>
            </View>

            {/* LOGIN FORM */}
            {method === "login" &&
              <View className='p-6 gap-2'>
                <Text className='my-8 text-center text-black font-semibold'>
                  Welcome back! Please login to continue
                </Text>
                
                <View className='flex-row gap-2 items-center'>
                  <User2Icon style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Username</Text>
                </View>
                <TextInput 
                    className='px-2 py-4 mb-4 border border-secondary-light rounded-md' 
                    placeholder='Enter your username' 
                    autoCapitalize="none"
                    value={username} 
                    onChangeText={setUsername} 
                />

                <View className='flex-row gap-2 items-center'>
                  <Lock style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Password</Text>
                </View>

                <View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
                  <TextInput className='flex-1' placeholder="Enter password" secureTextEntry={!showPassword}
                    value={password} onChangeText={setPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ?  <EyeClosed style={{ color: 'gray' }} /> : <Eye style={{ color: 'gray' }} /> }
                  </TouchableOpacity>
                </View>

                <TouchableOpacity className='p-4 rounded-md bg-secondary-strong ' onPress={submitForm}>
                  <Text className='text-center font-semibold text-white'>LOGIN</Text>
                </TouchableOpacity>
              </View>
            }

            {/* SIGNUP FORM */}
            {method === "signup" &&
              <View className='p-6 gap-2'>
                <Text className='my-4 text-center text-black font-semibold'>
                  Create an account to start ordering!
                </Text>

                <View className='flex-row gap-2 items-center'>
                  <Mail style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>First Name</Text>
                </View>
                <TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md' placeholder='Enter your first name' value={firstName} onChangeText={setFirstName} />

                <View className='flex-row gap-2 items-center'>
                  <Mail style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Last Name</Text>
                </View>
                <TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md' placeholder='Enter your last name' value={lastName} onChangeText={setLastName} />

                <View className='flex-row gap-2 items-center'>
                  <Mail style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Email Address</Text>
                </View>
                <TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md' placeholder='Enter your email address' value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none"/>

                <View className='flex-row gap-2 items-center'>
                  <User2Icon style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Username</Text>
                </View>
                <TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md' placeholder='Enter your username' value={username} onChangeText={setUsername} autoCapitalize="none"/>

                <View className='flex-row gap-2 items-center'>
                  <Lock style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Password</Text>
                </View>
                <View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
                  <TextInput className='flex-1' placeholder="Enter password" secureTextEntry={!showPassword}
                    value={password} onChangeText={setPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ?  <EyeClosed style={{ color: 'gray' }} /> : <Eye style={{ color: 'gray' }} /> }
                  </TouchableOpacity>
                </View>

                <View className='flex-row gap-2 items-center'>
                  <Lock style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>Confirm Password</Text>
                </View>
                <View className='px-2 py-1 mb-4 border border-secondary-light rounded-md flex-row gap-2 items-center'>
                  <TextInput className='flex-1' placeholder="Re-enter your password" secureTextEntry={!showPassword}
                    value={confirmPassword} onChangeText={setConfirmPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ?  <EyeClosed style={{ color: 'gray' }} /> : <Eye style={{ color: 'gray' }} /> }
                  </TouchableOpacity>
                </View>

                <TouchableOpacity className='p-4 rounded-md bg-secondary-strong ' onPress={submitForm}>
                  <Text className='text-center font-semibold text-white'>SIGN UP</Text>
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