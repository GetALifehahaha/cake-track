import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router' 
import React, { useState, useContext, useEffect } from 'react'
import { Lock, Mail, Eye, EyeClosed, User2Icon } from 'lucide-react-native'
import { AuthContext } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
// 1. Import Google Sign-In
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const LoginSignup = ({ method }) => {
  const { showToast } = useToast();
  // 2. Destructure googleLogin from context
  const { login, loading, register, googleLogin } = useContext(AuthContext)
  
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup specific
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 3. Configure Google Sign-In on mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CONSOLE', // <--- REPLACE THIS
      offlineAccess: true,
    });
  }, []);

  // 4. Handle Google Login
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Get the ID token to send to backend
      const { idToken } = userInfo;
      
      if (idToken) {
        // Pass 'app' source to backend to allow account creation
        const res = await googleLogin(idToken, 'app'); 
        
        if (res.success) {
          showToast("Logged in with Google!", "success");
          router.replace('/(tabs)/');
        } else {
          showToast(res.error || "Google Auth failed", "error");
        }
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToast("Sign in is in progress", "info");
      } else {
        console.error(error);
        showToast("Google Sign-In Error", "error");
      }
    }
  };

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
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
                <Text className='text-center text-black font-semibold'>
                  Welcome back! Please login to continue
                </Text>

                {/* 5. GOOGLE LOGIN BUTTON */}
                <TouchableOpacity 
                  onPress={handleGoogleSignIn}
                  className="bg-white border border-gray-300 flex-row items-center justify-center p-3 rounded-md mt-4 shadow-sm"
                >
                  <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }} 
                    style={{ width: 20, height: 20, marginRight: 10 }} 
                  />
                  <Text className="text-gray-700 font-semibold">Continue with Google</Text>
                </TouchableOpacity>

                <View className='h-0.5 w-full bg-gray-300 my-8'/>
                
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
                <Text className='text-center text-black font-semibold'>
                  Create an account to start ordering!
                </Text>

                {/* 6. GOOGLE LOGIN BUTTON (Signup) */}
                <TouchableOpacity 
                  onPress={handleGoogleSignIn}
                  className="bg-white border border-gray-300 flex-row items-center justify-center p-3 rounded-md mt-4 shadow-sm"
                >
                  <Image 
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }} 
                    style={{ width: 20, height: 20, marginRight: 10 }} 
                  />
                  <Text className="text-gray-700 font-semibold">Sign up with Google</Text>
                </TouchableOpacity>

                <View className='h-0.5 w-full bg-gray-300 my-8'/>

                <View className='flex-row gap-2 items-center'>
                  <Mail style={{ color: "#BE9B7B" }} size={16} />
                  <Text className=''>First Name</Text>
                </View>
                <TextInput className='px-2 py-4 mb-4 border border-secondary-light rounded-md' placeholder='Enter your first name' value={firstName} onChangeText={setFirstName} />

                {/* ... rest of signup form inputs ... */}
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