import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, X } from 'lucide-react-native';
import { useOpening } from '@/context/OpeningContext';
import { useToast } from '@/context/ToastContext';

const TimePicker = ({ onSelectTime }) => {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState(null);
    const [pickerValue, setPickerValue] = useState(new Date());
    const { openingTime } = useOpening();
    const { showToast } = useToast();

    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return null;
        const parts = String(timeStr).split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1] || '0', 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
    };

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

    const isTimeWithinBusinessHours = (selectedDate) => {
        if (!openingTime) return true; // no opening config → allow any time

        const openStr = openingTime.open ?? openingTime.opening_time ?? openingTime.start ?? openingTime.start_time;
        const closeStr = openingTime.close ?? openingTime.closing_time ?? openingTime.end ?? openingTime.end_time;
        const openM = parseTimeToMinutes(openStr);
        const closeM = parseTimeToMinutes(closeStr);
        if (openM == null || closeM == null) return true;

        const minutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();

        if (closeM <= openM) {
            return minutes >= openM || minutes < closeM;
        }

        return minutes >= openM && minutes < closeM;
    };

    const applySelectedTime = (selectedTime) => {
        if (!selectedTime) return;

        if (!isTimeWithinBusinessHours(selectedTime)) {
            showToast?.(`Selected time is outside business hours (${getAllowedRangeString()})`, 'error');
            return;
        }

        const hh = selectedTime.getHours().toString().padStart(2, '0');
        const mm = selectedTime.getMinutes().toString().padStart(2, '0');
        const formatted = `${hh}:${mm}`;

        setTime(formatToAmPm(formatted));
        onSelectTime?.(selectedTime);
    };

    const openPicker = () => {
        setOpen(true);
    };

    const clearTime = () => {
        setTime(null);
        onSelectTime?.(null);
        setOpen(false);
    };

    const handleAndroidChange = (event, selectedTime) => {
        if (event?.type === 'dismissed' || !selectedTime) {
            setOpen(false);
            return;
        }

        setPickerValue(selectedTime);
        applySelectedTime(selectedTime);
        setOpen(false);
    };

    const handleIOSChange = (_, selectedTime) => {
        if (selectedTime) {
            setPickerValue(selectedTime);
        }
    };

    const confirmIOSSelection = () => {
        applySelectedTime(pickerValue);
        setOpen(false);
    };

    return (
        <>
            <TouchableOpacity
                className="flex-row items-center justify-between rounded-md mt-2 px-3 py-2 border border-secondary-light bg-white"
                onPress={openPicker}
            >
                <Text className="text-secondary-strong">
                    {time || "Select time"}
                </Text>
                <View className='flex-row items-center gap-2'>
                    {time && (
                        <TouchableOpacity onPress={clearTime}>
                            <X color="#8B5A3C" size={18} />
                        </TouchableOpacity>
                    )}
                    <Clock color="#8B5A3C" />
                </View>
            </TouchableOpacity>

            {Platform.OS === 'android' && open && (
                <DateTimePicker
                    mode="time"
                    value={pickerValue}
                    onChange={handleAndroidChange}
                    is24Hour={false}
                />
            )}

            {Platform.OS === 'ios' && open && (
                <Modal transparent animationType="slide" onRequestClose={() => setOpen(false)}>
                    <View className='flex-1 bg-black/30 justify-center'>
                        <View className='bg-white mx-4 rounded-lg overflow-hidden'>
                            <View className='flex-row items-center justify-between p-3 border-b border-secondary-light'>
                                <Text className='font-semibold text-lg text-secondary-strong'>Select Time</Text>
                                <TouchableOpacity onPress={() => setOpen(false)}>
                                    <X color="#8B5A3C" />
                                </TouchableOpacity>
                            </View>

                            <View className='p-4'>
                                <DateTimePicker
                                    mode="time"
                                    value={pickerValue}
                                    onChange={handleIOSChange}
                                    is24Hour={false}
                                    display='spinner'
                                />
                            </View>

                            <View className='flex-row items-center justify-end gap-2 p-3 border-t border-secondary-light'>
                                {time && (
                                    <TouchableOpacity onPress={clearTime} className='px-3 py-2'>
                                        <Text className='text-[#8B5A3C] font-semibold'>Clear</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => setOpen(false)} className='px-3 py-2'>
                                    <Text className='text-[#8B5A3C] font-semibold'>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmIOSSelection} className='px-3 py-2'>
                                    <Text className='text-[#8B5A3C] font-semibold'>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
};

export default TimePicker;
