import React, { useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '@/context/ToastContext';
import api from '@/api/api';

export default function PaymentScreen() {
    const { showToast } = useToast();
    const router = useRouter();
    
    // Retrieve params passed from CustomOrders
    const { checkoutUrl, orderId } = useLocalSearchParams();

    const [verifying, setVerifying] = useState(false);
    const handledRef = useRef(false); // Prevent double-handling

    // PATHS to match against (ignores domain to avoid localhost vs ngrok issues)
    const SUCCESS_PATH = '/payment/success';
    const FAILED_PATH = '/payment/failed';

    const verifyPayment = async () => {
        const MAX_ATTEMPTS = 5;
        const INTERVAL_MS = 2000;

        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            try {
                const response = await api.post('/payment/verify/', { order_id: orderId });
                if (response.data?.verified) {
                    return true;
                }
            } catch (err) {
                console.warn("Verify attempt failed:", err.message);
            }
            // Wait before retrying (source may still be transitioning to chargeable)
            if (i < MAX_ATTEMPTS - 1) {
                await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
            }
        }
        return false;
    };

    const handleRequest = (request) => {
        const { url } = request;

        // 1. Detect Success
        if (url.includes(SUCCESS_PATH) && !handledRef.current) {
            handledRef.current = true;
            setVerifying(true);

            verifyPayment().then((confirmed) => {
                setVerifying(false);
                if (confirmed) {
                    showToast("Payment successful!", "success");
                } else {
                    showToast("Payment received. It may take a moment to reflect.", "info");
                }
                router.replace('/orderSuccess');
            });

            return false; // Stop WebView loading
        }

        // 2. Detect Failure
        if (url.includes(FAILED_PATH) && !handledRef.current) {
            handledRef.current = true;
            showToast("Payment failed or cancelled. You can retry from your orders.", "error");
            router.replace('/(tabs)/orders');
            return false; // Stop WebView loading
        }

        return true; // Allow all other URLs (PayMongo/GCash login)
    };

    if (verifying) {
        return (
            <View style={styles.verifying}>
                <ActivityIndicator size="large" color="#8B5A3C" />
                <Text style={styles.verifyingText}>Verifying payment...</Text>
            </View>
        );
    }

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
    verifying: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    verifyingText: {
        fontSize: 16,
        color: '#8B5A3C',
        fontWeight: '600',
        marginTop: 12,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 10,
    },
});