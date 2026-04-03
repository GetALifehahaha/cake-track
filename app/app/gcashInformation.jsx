import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';

const GCashPaymentScreen = () => {
    const [copied, setCopied] = useState(false);
    const toastOpacity = React.useRef(new Animated.Value(0)).current;

    const handleCopy = async () => {
        const number = '09942867630';

        await Clipboard.setStringAsync(number);

        setCopied(true);
        Animated.sequence([
            Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.delay(1500),
            Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => setCopied(false));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Status Icon */}
                <View style={styles.iconCircle}>
                    <Text style={styles.checkmark}>✓</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Order Confirmed</Text>
                <Text style={styles.subtitle}>
                    Your order has been saved.{'\n'}Complete your payment via GCash.
                </Text>

                {/* Badge */}
                <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>PAY VIA GCASH</Text>
                </View>

                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>Account Details</Text>

                {/* Account Name Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Account Name</Text>
                    <Text style={styles.infoValue}>A********R J. S.</Text>
                </View>

                {/* Phone Number Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.numberValue}>0994 286 7630</Text>
                </View>

                {/* Copy Button */}
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.85}>
                    <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Number'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')} activeOpacity={0.85}>
                    <Text style={styles.backBtnText}>Proceed to Home</Text>
                </TouchableOpacity>

                {/* Toast */}
                <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
                    <Text style={styles.toastText}>Number copied!</Text>
                </Animated.View>


            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5ede4',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },

    // Icon
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#8b5e3c',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    checkmark: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '500',
    },

    // Text
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#3b2010',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#9c7a5e',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },

    // Badge
    badgePill: {
        backgroundColor: '#f3ede6',
        borderWidth: 1,
        borderColor: '#e0ceba',
        borderRadius: 99,
        paddingVertical: 4,
        paddingHorizontal: 14,
        marginBottom: 20,
    },
    badgeText: {
        fontSize: 10,
        color: '#8b5e3c',
        letterSpacing: 1.2,
    },

    // Divider & label
    divider: {
        width: '100%',
        height: 0.5,
        backgroundColor: '#e8ddd0',
        marginBottom: 12,
    },
    sectionLabel: {
        alignSelf: 'flex-start',
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: '#b89880',
        marginBottom: 10,
    },

    // Info Cards
    infoCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eddecf',
        paddingVertical: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 12,
        color: '#b89880',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4a2c14',
        letterSpacing: 0.3,
    },
    numberValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#7a4520',
        letterSpacing: 1,
    },

    // Copy Button
    copyBtn: {
        width: '100%',
        marginTop: 20,
        paddingVertical: 15,
        borderRadius: 14,
        backgroundColor: '#7a4520',
        alignItems: 'center',
        justifyContent: 'center',
    },
    copyBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.6,
    },
    backBtn: {
        width: '100%',
        marginTop: 20,
        paddingVertical: 15,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#7a452050",
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnText: {
        color: '#7a4520',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.6,
    },

    // Toast
    toast: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: '#7a4520',
        paddingVertical: 6,
        paddingHorizontal: 18,
        borderRadius: 99,
    },
    toastText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default GCashPaymentScreen;