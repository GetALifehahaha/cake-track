import { X, Check } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

const FILTER_OPTIONS = [
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Ready For Pickup', value: 'ready' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Refunded', value: 'refunded' },
];

const MAX_FILTERS = 3;

const OrderFilter = ({ show, activeFilters, onChoose, onClose }) => {
    const [selected, setSelected] = useState([]);
    const [limitMessage, setLimitMessage] = useState('');

    // Sync state with props when modal opens
    useEffect(() => {
        if (show) {
            setSelected((activeFilters || []).slice(0, MAX_FILTERS));
            setLimitMessage('');
        }
    }, [show, activeFilters]);

    const toggleSelection = (value) => {
        if (selected.includes(value)) {
            setSelected(selected.filter(item => item !== value));
            setLimitMessage('');
        } else {
            if (selected.length >= MAX_FILTERS) {
                setLimitMessage(`You can only select up to ${MAX_FILTERS} filters.`);
                return;
            }
            setSelected([...selected, value]);
            setLimitMessage('');
        }
    };

    const handleClear = () => {
        onChoose([]);
        setLimitMessage('');
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
                                    <X size={24} color="#8B5A3C" />
                                </TouchableOpacity>
                            </View>

                            {/* Filter Options (Checkboxes) */}
                            <View className='flex-col gap-3 mb-8'>
                                <Text className="text-gray-500 font-semibold mb-2">Status</Text>
                                {limitMessage ? (
                                    <Text className="text-xs text-red-500 -mt-1 mb-2">{limitMessage}</Text>
                                ) : null}
                                {FILTER_OPTIONS.map((option) => {
                                    // Define the specific text color based on the status value
                                    let statusColor = 'text-gray-600'; // Default fallback

                                    const isSelected = selected.includes(option.value);
                                    const isDisabled = !isSelected && selected.length >= MAX_FILTERS;

                                    switch (option.value) {
                                        case 'unpaid':
                                            statusColor = 'text-orange-500';
                                            break;
                                        case 'pending':
                                            statusColor = 'text-secondary-light';
                                            break;
                                        case 'rejected':
                                        case 'refunded':
                                            statusColor = 'text-red-500';
                                            break;
                                        case 'ready': // Adjust if your value is 'ready_for_pickup'
                                        case 'ready_for_pickup':
                                            statusColor = 'text-yellow-500';
                                            break;
                                        case 'accepted':
                                        case 'completed':
                                            statusColor = 'text-green-500';
                                            break;
                                        default:
                                            break;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => toggleSelection(option.value)}
                                            className={`flex-row items-center justify-between py-2 ${isDisabled ? 'opacity-50' : ''}`}
                                        >
                                            {/* Text now always uses the statusColor */}
                                            <Text className={`text-xl font-bold ${statusColor}`}>
                                                {option.label}
                                            </Text>

                                            {/* Checkbox remains the same (logic for checkbox fill usually needs isSelected) */}
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