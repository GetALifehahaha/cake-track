import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Multi-segment cake silhouette (candles + icing + body) in a 64x64 viewbox.
const CAKE_OUTLINE_PATH = [
    'M20 18 C16 18 13 15 13 11 C13 7 16 4 20 4 C24 4 27 7 27 11 C27 15 24 18 20 18',
    'M32 18 C28 18 25 15 25 11 C25 7 28 4 32 4 C36 4 39 7 39 11 C39 15 36 18 32 18',
    'M44 18 C40 18 37 15 37 11 C37 7 40 4 44 4 C48 4 51 7 51 11 C51 15 48 18 44 18',
    'M14 22 H50 V30 C50 35 46 38 41 38 H23 C18 38 14 35 14 30 V22 Z',
    'M12 38 H52 V52 H12 Z',
    'M20 38 V52',
    'M32 38 V52',
    'M44 38 V52',
].join(' ');

const CakeTraceLoader = ({
    size = 72,
    color = '#8B5A3C',
    trackColor = 'rgba(139,90,60,0.25)',
    strokeWidth = 2.6,
    duration = 1800,
    label,
    labelColor = '#8B5A3C',
    style,
}) => {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(progress, {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: false,
            }),
        );

        animation.start();

        return () => {
            animation.stop();
        };
    }, [duration, progress]);

    const dashOffset = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -100],
    });

    return (
        <View className='items-center justify-center' style={style}>
            <Svg width={size} height={size} viewBox='0 0 64 64'>
                <Path
                    d={CAKE_OUTLINE_PATH}
                    fill='none'
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    pathLength={100}
                />

                <AnimatedPath
                    d={CAKE_OUTLINE_PATH}
                    fill='none'
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    pathLength={100}
                    strokeDasharray='22 78'
                    strokeDashoffset={dashOffset}
                />
            </Svg>

            {label ? (
                <Text style={{ color: labelColor }} className='mt-2 text-xs font-semibold'>
                    {label}
                </Text>
            ) : null}
        </View>
    );
};

export default CakeTraceLoader;
