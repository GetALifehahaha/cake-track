import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { TouchableOpacity, Text, View, } from 'react-native';

// Utility component for the individual selectable box
const GridItem = ({ item, isSelected, onSelect }) => {
    const activeClasses = isSelected
        ? 'bg-secondary-strong text-white shadow-lg scale-[1.02] border-secondary-strong'
        : 'bg-white  border-secondary-light';

    return (
        <TouchableOpacity
            onPress={() => onSelect(item.value)}
            className={`
        flex items-center justify-center px-4 py-2 transition-all duration-200 ease-in-out
        rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer
        border-2 ${activeClasses}
        focus:outline-none focus:ring-4 focus:ring-[#A67C52]/50
      `}
        >
            <Text className={`text-md font-bold ${isSelected ? 'text-white' : 'text-secondary-light'}`}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );
};

const SelectionGrid = ({ items, placeholder, onChangeValue, defaultValue }) => {
    const selectionItems = Array.isArray(items) ? items : [];

    const [value, setValue] = useState(defaultValue || null);

    // Handle value change and propagate it up
    const handleValueChange = (val) => {
        setValue(val);
        if (onChangeValue) {
            onChangeValue(val);
        }
    };

    return (
        <View className="mt-4">
            {/* Responsive Grid/Flex Layout */}
            <View className="flex flex-row flex-wrap justify-start gap-2">
                {selectionItems.length > 0 ? (
                    selectionItems.map((item) => (
                        <GridItem
                            key={item.value}
                            item={item}
                            isSelected={item.value === value}
                            onSelect={handleValueChange}
                        />
                    ))
                ) : (
                    <Text className="text-gray-500 text-sm italic p-2">No selection items available.</Text>
                )}
            </View>
        </View>
    );
};

export default SelectionGrid;