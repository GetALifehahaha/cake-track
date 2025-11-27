import "./global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { View, ActivityIndicator } from "react-native";

const InitialLayout = () => {
  const { isAuthorized, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)'

    if (!isAuthorized && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthorized && inAuthGroup) {
      router.replace('/(tabs)')
    }


  }, [isAuthorized, loading, segments])

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5A3C" />
    </View>
  )

  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="customOrders"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="cakeOrders"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>
    </CartProvider>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <InitialLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
