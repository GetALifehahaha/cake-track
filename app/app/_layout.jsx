import "./global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { View, ActivityIndicator } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

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
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // 1. DELETE THE STRICT GUARD
    // We removed: if (!isAuthorized && !inAuthGroup) { router.replace(...) }
    // Now, if a user is not authorized, the app simply renders the Stack below,
    // which defaults to "(tabs)", allowing them to browse.

    // 2. KEEP THE REDIRECT FOR LOGGED IN USERS
    // If the user IS logged in, but is somehow looking at the Login/Register screens,
    // redirect them back to the main app.
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
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <InitialLayout />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
