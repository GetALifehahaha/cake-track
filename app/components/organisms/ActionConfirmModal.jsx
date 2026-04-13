import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const ActionConfirmModal = ({
    visible,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    destructive = false,
    loader = null,
}) => {
    const handleCancel = () => {
        if (loading) return;
        onCancel?.();
    };

    const handleConfirm = () => {
        if (loading) return;
        onConfirm?.();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={handleCancel}
        >
            <View className='flex-1 bg-black/50 justify-center items-center px-6'>
                <View className='bg-white w-full p-6 rounded-2xl shadow-lg'>
                    <Text className='text-xl font-bold mb-2 text-primary'>{title}</Text>
                    <Text className='text-secondary-strong mb-6'>{message}</Text>

                    <View className='flex-row gap-3'>
                        <TouchableOpacity
                            onPress={handleCancel}
                            disabled={loading}
                            className={`flex-1 items-center justify-center rounded-xl py-3 px-4 border border-[#d6b89f] bg-white ${loading ? 'opacity-60' : ''}`}
                        >
                            <Text className='text-[#7a4520] font-semibold text-base'>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={loading}
                            className={`flex-1 items-center justify-center rounded-xl py-3 px-4 ${destructive ? 'bg-red-500' : 'bg-[#8B5A3C]'} ${loading ? 'opacity-60' : ''}`}
                        >
                            {loading ? (
                                loader || <ActivityIndicator size='small' color='white' />
                            ) : (
                                <Text className='text-white font-semibold text-base'>{confirmText}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ActionConfirmModal;