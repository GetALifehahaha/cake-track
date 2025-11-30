import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { CheckCircle, XCircle, Info } from 'lucide-react-native';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success'); // 'success' | 'error' | 'info'
    const [visible, setVisible] = useState(false);

    // Animation Value (0 = invisible, 1 = fully visible)
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const showToast = (msg, type = 'success') => {
        setMessage(msg);
        setType(type);
        setVisible(true);

        // Fade In
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Auto Hide after 3 seconds
        setTimeout(() => {
            hideToast();
        }, 3000);
    };

    const hideToast = () => {
        // Fade Out
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
        });
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-blue-500';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle color="green" size={24} />;
            case 'error': return <XCircle color="red" size={24} />;
            default: return <Info color="gray" size={24} />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {/* THE TOAST UI COMPONENT */}
            {visible && (
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        position: 'absolute',
                        top: 60, // Adjust for status bar/notch
                        left: 20,
                        right: 20,
                        zIndex: 9999, // Ensure it sits on top
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0] // Slide down effect
                            })
                        }]
                    }}
                >
                    <View className={`flex-row items-center p-4 rounded-lg shadow-lg bg-white gap-2`}>
                        {getIcon()}
                        <Text className="ml-3 text-secondary-strong font-semibold flex-1">
                            {message}
                        </Text>
                        <TouchableOpacity onPress={hideToast}>
                            <Text className="text-secondary-light font-bold text-xs ml-2">DISMISS</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

// Custom Hook to use the toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};