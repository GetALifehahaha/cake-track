import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, X } from 'lucide-react-native';

const TimePicker = ({ onSelectTime }) => {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState(null);

    const handleChange = (_, selectedTime) => {
        if (selectedTime) {
            const hh = selectedTime.getHours().toString().padStart(2, '0');
            const mm = selectedTime.getMinutes().toString().padStart(2, '0');
            const formatted = `${hh}:${mm}`;

            setTime(formatted);
            onSelectTime(formatted);
        }
        setOpen(false);
    };

    return (
        <>
            <TouchableOpacity
                className="flex-row items-center justify-between rounded-md mt-2 px-3 py-2 border border-secondary-light bg-white"
                onPress={() => setOpen(true)}
            >
                <Text className="text-secondary-strong">
                    {time || "Select time"}
                </Text>
                <Clock color="#8B5A3C" />
            </TouchableOpacity>

            {open && (
                <Modal transparent animationType="slide">
                    <View className="flex-1 bg-black/30 justify-center">
                        <View className="bg-white mx-4 rounded-lg overflow-hidden">

                            <View className="flex-row items-center justify-between p-3 border-b">
                                <Text className="font-semibold text-lg">Select Time</Text>
                                <TouchableOpacity onPress={() => setOpen(false)}>
                                    <X />
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                mode="time"
                                value={new Date()}
                                onChange={handleChange}
                                is24Hour={true} // set to false if you want AM/PM
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
};

export default TimePicker;
