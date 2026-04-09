import 'react-native-gesture-handler';
import "./global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { OpeningProvider } from "@/context/OpeningContext";
import { GlobalRefreshProvider } from "@/context/GlobalRefreshContext";
import { View, ActivityIndicator } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// Add this near your 
configureReanimatedLogger({
  strict: false, // Disables the "Reading from `value` during component render" warning
  level: ReanimatedLogLevel.warn,
});

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { isAuthorized, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log(process.env.EXPO_PUBLIC_API_URL);

    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthorized && inAuthGroup) {
      router.replace('/(tabs)');
    }

  }, [isAuthorized, loading, segments]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5A3C" />
    </View>
  )

  return (
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
      <Stack.Screen
        name="orderSuccess"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="orderDetails"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="paymentScreen"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="imagePreview"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="locations"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="locationForm"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="locationPicker"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen
        name="faq"
        options={{
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="termsOfService"
        options={{
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="termsAndConditions"
        options={{
          presentation: 'card',
          animation: 'slide_from_right'
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <OpeningProvider>
              <GlobalRefreshProvider>
                <CartProvider>
                  <InitialLayout />
                </CartProvider>
              </GlobalRefreshProvider>
            </OpeningProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
