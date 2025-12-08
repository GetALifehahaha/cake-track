import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '@/context/ToastContext';

export default function PaymentScreen() {
    const { showToast } = useToast();
    const router = useRouter();
    
    // Retrieve params passed from CustomOrders
    const { checkoutUrl, orderId } = useLocalSearchParams();

    // PATHS to match against (ignores domain to avoid localhost vs ngrok issues)
    const SUCCESS_PATH = '/payment/success';
    const FAILED_PATH = '/payment/failed';

    const handleRequest = (request) => {
        const { url } = request;

        // 1. Detect Success
        if (url.includes(SUCCESS_PATH)) {
            showToast("Payment successful! Verifying...", "success");
            
            // Redirect to a Success Page or Order Details
            // Use 'replace' so the user can't go back to the payment page
            router.replace('/orderSuccess'); 
            return false; // Stop WebView loading
        }

        // 2. Detect Failure
        if (url.includes(FAILED_PATH)) {
            showToast("Payment failed or cancelled.", "error");
            router.back(); // Go back to the order form
            return false; // Stop WebView loading
        }

        return true; // Allow all other URLs (PayMongo/GCash login)
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: checkoutUrl }}
                
                // Intercept requests BEFORE they load (iOS/Android)
                onShouldStartLoadWithRequest={handleRequest}
                
                // Fallback listener for state changes
                onNavigationStateChange={handleRequest}
                
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator size="large" color="#8B5A3C" style={styles.loader} />
                )}
                
                // IMPORTANT: Enable JS for GCash pages to work
                javaScriptEnabled={true}
                domStorageEnabled={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 10,
    },
});