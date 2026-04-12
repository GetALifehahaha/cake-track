import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Check, ChevronDown, Sparkles } from 'lucide-react-native';

const ModalSelectButton = ({
    items = [],
    placeholder = 'Select an option',
    value,
    defaultValue = null,
    onChangeValue,
    title = 'Select an option',
    subtitle = 'Choose one option below.',
    disabled = false,
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [visible, setVisible] = useState(false);

    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const sheetTranslateY = useRef(new Animated.Value(40)).current;
    const sheetScale = useRef(new Animated.Value(0.98)).current;

    const currentValue = value !== undefined ? value : internalValue;

    const selectedLabel = useMemo(() => {
        const selected = items.find((item) => item.value === currentValue);
        return selected?.label;
    }, [items, currentValue]);

    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    const openModal = () => {
        if (disabled) return;

        setVisible(true);

        requestAnimationFrame(() => {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 220,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(sheetTranslateY, {
                    toValue: 0,
                    speed: 15,
                    bounciness: 7,
                    useNativeDriver: true,
                }),
                Animated.spring(sheetScale, {
                    toValue: 1,
                    speed: 16,
                    bounciness: 5,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: 40,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(sheetScale, {
                toValue: 0.98,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => setVisible(false));
    };

    const handleSelect = (nextValue) => {
        if (value === undefined) {
            setInternalValue(nextValue);
        }

        onChangeValue?.(nextValue);
        closeModal();
    };

    return (
        <>
            <TouchableOpacity
                onPress={openModal}
                disabled={disabled}
                activeOpacity={0.85}
                className={`mt-2 rounded-xl border px-4 py-4 flex-row items-center justify-between ${
                    disabled
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-white border-secondary-light shadow-sm'
                }`}
            >
                <Text className={`${selectedLabel ? 'text-primary font-semibold' : 'text-secondary-light'} text-base`}>
                    {selectedLabel || placeholder}
                </Text>
                <ChevronDown size={20} color="#8B5A3C" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={closeModal}
            >
                <View className="flex-1 justify-end">
                    <Animated.View style={{ opacity: backdropOpacity }} className="absolute inset-0 bg-black/55" />
                    <Pressable className="absolute inset-0" onPress={closeModal} />

                    <Animated.View
                        style={{
                            opacity: backdropOpacity,
                            transform: [{ translateY: sheetTranslateY }, { scale: sheetScale }],
                        }}
                        className="bg-[#FFF8EF] rounded-t-[2rem] px-6 pt-5 pb-8 border-t border-[#E2C09E]"
                    >
                        <View className="w-14 h-1.5 rounded-full bg-[#D5AF89] self-center mb-4" />

                        <View className="flex-row items-center gap-2 mb-1">
                            <Sparkles size={16} color="#8B5A3C" />
                            <Text className="text-[#8B5A3C] text-xl font-bold">{title}</Text>
                        </View>
                        <Text className="text-[#9A8978] text-sm">{subtitle}</Text>

                        <ScrollView style={{ maxHeight: 340 }} className="mt-4" showsVerticalScrollIndicator={false}>
                            <View className="gap-2 pb-2">
                                {items.map((item) => {
                                    const isSelected = item.value === currentValue;

                                    return (
                                        <TouchableOpacity
                                            key={String(item.value)}
                                            activeOpacity={0.86}
                                            onPress={() => handleSelect(item.value)}
                                            className={`rounded-xl px-4 py-4 border flex-row items-center justify-between ${
                                                isSelected
                                                    ? 'bg-[#8B5A3C] border-[#8B5A3C]'
                                                    : 'bg-white border-[#E7D2BE]'
                                            }`}
                                        >
                                            <Text className={`${isSelected ? 'text-white font-bold' : 'text-[#5E4834] font-semibold'} text-base`}>
                                                {item.label}
                                            </Text>
                                            {isSelected && <Check size={18} color="#ffffff" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={closeModal}
                            activeOpacity={0.9}
                            className="mt-5 rounded-xl border border-[#DDBA96] bg-white px-4 py-3 items-center"
                        >
                            <Text className="text-[#8B5A3C] font-semibold">Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
};

export default ModalSelectButton;
