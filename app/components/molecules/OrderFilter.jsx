import { X, Check } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

const FILTER_OPTIONS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Ready For Pickup', value: 'ready' },
    { label: 'Rejected', value: 'rejected' },
];

const OrderFilter = ({ show, activeFilters, onChoose, onClose }) => {
    const [selected, setSelected] = useState([]);

    // Sync state with props when modal opens
    useEffect(() => {
        if (show) {
            // If activeFilters is passed, use it; otherwise default to empty
            setSelected(activeFilters);
        }
    }, [show, activeFilters]);

    const toggleSelection = (value) => {
        if (selected.includes(value)) {
            setSelected(selected.filter(item => item !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    const handleClear = () => {
        onChoose([]);
        onClose();
    };

    const handleApply = () => {
        onChoose(selected);
        onClose();
    };

    return (
        <>
            {show &&
                <View className="absolute bottom-0 left-0 h-full w-full z-50">
                    {/* Backdrop */}
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={onClose}
                        className="absolute h-full w-full bg-black/50"
                    />
                    
                    {/* Modal Content */}
                    <View className="flex-1 justify-end">
                        <View className='bg-white w-full p-8 rounded-t-[3rem] shadow-xl'>
                            
                            {/* Header */}
                            <View className='flex-row justify-between items-center mb-6'>
                                <View className="w-5" /> 
                                <Text className='font-bold text-xl text-primary'>Filter Orders</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <X size={24} color="#8B5A3C"/>
                                </TouchableOpacity>
                            </View>

                            {/* Filter Options (Checkboxes) */}
                            <View className='flex-col gap-3 mb-8'>
                                <Text className="text-gray-500 font-semibold mb-2">Status</Text>
                                {FILTER_OPTIONS.map((option) => {
                                    const isSelected = selected.includes(option.value);
                                    return (
                                        <TouchableOpacity 
                                            key={option.value}
                                            onPress={() => toggleSelection(option.value)}
                                            className="flex-row items-center justify-between py-2"
                                        >
                                            <Text className={`text-lg ${isSelected ? 'text-secondary-strong font-semibold' : 'text-gray-600'}`}>
                                                {option.label}
                                            </Text>
                                            
                                            <View className={`w-6 h-6 rounded-md border items-center justify-center ${isSelected ? 'bg-secondary-strong border-secondary-strong' : 'border-gray-300 bg-white'}`}>
                                                {isSelected && <Check size={16} color="white" />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Actions */}
                            <View className='flex-row gap-4 items-center border-t border-t-gray-200 pt-6'>
                                <TouchableOpacity 
                                    onPress={handleClear}
                                    className='flex-1 justify-center items-center rounded-xl p-4 border border-gray-300 active:bg-gray-100'
                                >
                                    <Text className='font-semibold text-gray-600'>Clear All</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    onPress={handleApply}
                                    className='flex-1 justify-center items-center rounded-xl p-4 bg-secondary-strong active:opacity-90 shadow-sm'
                                >
                                    <Text className='font-semibold text-white'>Apply Filters</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            }
        </>
    )
}

export default OrderFilter;