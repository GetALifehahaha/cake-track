import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';

export default function PaymentScreen() {
    const { showToast } = useToast();
    const navigation = useNavigation();
    const route = useRoute();
    const { checkoutUrl, orderId } = route.params;

    // We check for the PATH only to avoid localhost vs ngrok mismatch issues
    const SUCCESS_PATH = '/payment/success';
    const FAILED_PATH = '/payment/failed';

    const handleRequest = (request) => {
        const { url } = request;

        // 1. Detect Success
        if (url.includes(SUCCESS_PATH)) {
            showToast("We are verifying your payment...", "info");
            navigation.replace('OrderDetails', { orderId: orderId, refresh: true });
            return false; // STOP the WebView from loading this URL
        }

        // 2. Detect Failure
        if (url.includes(FAILED_PATH)) {
            showToast("The transaction was cancelled or failed.", "error");
            navigation.goBack();
            return false; // STOP the WebView
        }

        return true; // Allow all other URLs (like PayMongo/GCash) to load
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: checkoutUrl }}
                
                // Use this to intercept BEFORE loading
                onShouldStartLoadWithRequest={handleRequest}
                
                // Keep this for Android compatibility in some cases
                onNavigationStateChange={handleRequest} 
                
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
    },
});