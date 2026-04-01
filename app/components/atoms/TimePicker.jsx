import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, X } from 'lucide-react-native';
import { useOpening } from '@/context/OpeningContext';
import { useToast } from '@/context/ToastContext';

const TimePicker = ({ onSelectTime }) => {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState(null);
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

    const handleChange = (_, selectedTime) => {
        if (selectedTime) {
            if (!isTimeWithinBusinessHours(selectedTime)) {
                showToast?.(`Selected time is outside business hours (${getAllowedRangeString()})`, 'error');
            } else {
                const hh = selectedTime.getHours().toString().padStart(2, '0');
                const mm = selectedTime.getMinutes().toString().padStart(2, '0');
                const formatted = `${hh}:${mm}`;

                setTime(formatToAmPm(formatted));

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
                    <DateTimePicker
                        mode="time"
                        value={new Date()}
                        onChange={handleChange}
                        is24Hour={false} // show AM/PM
                    />
                </Modal>
            )}
        </>
    );
};

export default TimePicker;
