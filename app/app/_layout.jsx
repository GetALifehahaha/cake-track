import 'react-native-gesture-handler';
import "./global.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { OpeningProvider } from "@/context/OpeningContext";
import { GlobalRefreshProvider } from "@/context/GlobalRefreshContext";
import { AppState, View, ActivityIndicator, Modal, Text, TouchableOpacity } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Updates from 'expo-updates';


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
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(false);
  const updateCheckInProgress = useRef(false);
  const hasCheckedForUpdate = useRef(false);

  const checkForEasUpdate = useCallback(async () => {
    if (__DEV__ || !Updates.isEnabled || updateCheckInProgress.current || updatingApp) {
      return;
    }

    try {
      updateCheckInProgress.current = true;
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setShowUpdatePrompt(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      updateCheckInProgress.current = false;
    }
  }, [updatingApp]);

  const handleUpdateApp = useCallback(async () => {
    if (__DEV__ || !Updates.isEnabled || updatingApp) {
      return;
    }

    try {
      setUpdatingApp(true);
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        await Updates.reloadAsync();
        return;
      }
      setShowUpdatePrompt(false);
    } catch (error) {
      console.error('Failed to apply update:', error);
    } finally {
      setUpdatingApp(false);
    }
  }, [updatingApp]);

  useEffect(() => {
    console.log(process.env.EXPO_PUBLIC_API_URL);

    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthorized && inAuthGroup) {
      router.replace('/(tabs)');
    }

  }, [isAuthorized, loading, segments]);

  useEffect(() => {
    if (loading || hasCheckedForUpdate.current) {
      return;
    }

    hasCheckedForUpdate.current = true;
    checkForEasUpdate();
  }, [loading, checkForEasUpdate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkForEasUpdate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkForEasUpdate]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#8B5A3C" />
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
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

      <Modal
        visible={showUpdatePrompt}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E7D8C8',
            padding: 20,
          }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#6B5235' }}>
              A new update is available.
            </Text>
            <Text style={{ marginTop: 8, color: '#6B7280', lineHeight: 20 }}>
              Please update now to get the latest fixes, features, and performance improvements.
            </Text>

            <TouchableOpacity
              style={{
                marginTop: 18,
                backgroundColor: '#8B5A3C',
                borderRadius: 12,
                minHeight: 46,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleUpdateApp}
              disabled={updatingApp}
              activeOpacity={0.9}
            >
              {updatingApp ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Update App</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
