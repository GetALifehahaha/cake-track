import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import CakeTraceLoader from '@/components/atoms/CakeTraceLoader';

const FloatingCakeLoader = ({
    size = 54,
    cakeSize = 30,
    style,
    ballColor = 'rgba(255,255,255,0.94)',
    borderColor = 'rgba(139,90,60,0.22)',
    cakeColor = '#8B5A3C',
    cakeTrackColor = 'rgba(139,90,60,0.25)',
}) => {
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 760,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 760,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [floatAnim]);

    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
    });

    return (
        <Animated.View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: ballColor,
                    borderWidth: 1,
                    borderColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#8B5A3C',
                    shadowOpacity: 0.2,
                    shadowRadius: 9,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                    transform: [{ translateY }],
                },
                style,
            ]}
        >
            <CakeTraceLoader
                size={cakeSize}
                color={cakeColor}
                trackColor={cakeTrackColor}
                strokeWidth={2.3}
                duration={1600}
            />
        </Animated.View>
    );
};

export default FloatingCakeLoader;