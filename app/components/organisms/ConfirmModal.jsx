import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const ConfirmModal = ({ children, details, prevent, preventDetails, onConfirm, }) => {
    // 1. Unified state name (used 'visible' for clarity)
    const [visible, setVisible] = useState(false);

    const handleConfirm = () => {
        onConfirm();      
        setVisible(false); 
    }

    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)}>
                {children}
            </TouchableOpacity>

            <Modal
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)} 
            >
                <View className='flex-1 bg-black/50 justify-center items-center px-6'>

                    {/* 4. The White Card */}
                    <View className='bg-white w-full p-6 rounded-2xl shadow-lg'>
                        <Text className='text-xl font-bold mb-2 text-primary'>Are you sure?</Text>

                        <Text className='text-secondary-strong mb-12'>
                            {details}
                        </Text>

                        <View className='flex-row justify-end gap-8'>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Text className='text-secondary-light font-bold text-lg'>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleConfirm}>
                                <Text className='text-primary font-bold text-lg'>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </Modal>
        </>
    )
}

export default ConfirmModal