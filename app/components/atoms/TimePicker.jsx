import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, X } from 'lucide-react-native';
import { useOpening } from '@/context/OpeningContext';
import { useToast } from '@/context/ToastContext';

const TimePicker = ({ onSelectTime }) => {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState(null);
    const { openingTime, isOrderingAllowed } = useOpening();
    const { showToast } = useToast();

    const formatToAmPm = (hhmm) => {
        if (!hhmm) return '';
        // hh:mm string
        const [hh, mm] = hhmm.split(':').map(s => parseInt(s, 10));
        const period = hh >= 12 ? 'PM' : 'AM';
        const hour = ((hh + 11) % 12) + 1; // convert 0->12
        return `${hour}:${String(mm).padStart(2, '0')} ${period}`;
    }

    const getAllowedRangeString = () => {
        if (!openingTime) return '';
        const openStr = openingTime.open ?? openingTime.opening_time ?? openingTime.start ?? openingTime.start_time;
        const closeStr = openingTime.close ?? openingTime.closing_time ?? openingTime.end ?? openingTime.end_time;
        const openFormatted = formatToAmPm(openStr);
        const closeFormatted = formatToAmPm(closeStr);
        return `${openFormatted} - ${closeFormatted}`;
    }

    const handleChange = (_, selectedTime) => {
        if (selectedTime) {
            // Validate with opening hours (use current date for comparison)
            const nowDate = new Date();
            const candidate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), selectedTime.getHours(), selectedTime.getMinutes());

            if (isOrderingAllowed && !isOrderingAllowed(candidate)) {
                showToast?.(`Selected time is outside business hours (${getAllowedRangeString()})`, 'error');
                // Do not set time if invalid
            } else {
                const hh = selectedTime.getHours().toString().padStart(2, '0');
                const mm = selectedTime.getMinutes().toString().padStart(2, '0');
                const formatted = `${hh}:${mm}`;

                setTime(formatToAmPm(formatted));
                // pass Date object back so consumers can format for backend; keep original Date
                onSelectTime(selectedTime);
            }
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
                                        is24Hour={false} // show AM/PM
                                    />
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
};

export default TimePicker;
