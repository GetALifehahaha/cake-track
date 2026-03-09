import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Calendar1, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Modal } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useOpening } from '@/context/OpeningContext';
import { useToast } from '@/context/ToastContext';


const DatePicker = ({ onSelectDate }) => {

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(null);
    const { blockedDates, isDateBlocked } = useOpening();
    const { showToast } = useToast();

    // Build markedDates map for disabled days
    const buildDisabledMap = () => {
        const map = {};
        if (!blockedDates || !blockedDates.length) return map;

        const dateOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const addDateKey = (d) => {
            const iso = d.toISOString().split('T')[0];
            map[iso] = { disabled: true, disableTouchEvent: true, marked: true, selected: false };
        }

        for (const bd of blockedDates) {
            if (!bd) continue;
            if (typeof bd === 'string') {
                const d = new Date(bd);
                addDateKey(dateOnly(d));
            } else if (bd.start_date || bd.end_date || bd.start || bd.end) {
                const start = new Date(bd.start_date ?? bd.start);
                const end = new Date(bd.end_date ?? bd.end ?? bd.start_date);
                for (let d = dateOnly(start); +d <= +dateOnly(end); d.setDate(d.getDate() + 1)) {
                    addDateKey(new Date(d));
                }
            } else if (bd.date) {
                const d = new Date(bd.date);
                addDateKey(dateOnly(d));
            }
        }

        return map;
    }

    const disabledMap = buildDisabledMap();

    useEffect(() => {
        onSelectDate(date)
    }, [date])

    return (
        <>
            <TouchableOpacity className='flex-row items-center justify-between rounded-md mt-2 px-3 py-2 border border-secondary-light bg-white' onPress={() => setOpen(!open)}>
                <Text className='text-secondary-strong'>{date || "Select date"}</Text>
                <Calendar1 style={{ color: "#8B5A3C" }} />
            </TouchableOpacity>
            <Modal
                visible={open}
                transparent
                animationType="slide"
                onRequestClose={() => setOpen(false)}
            >
                <View className="flex-1 bg-black/30 justify-center">
                    <View className="bg-white mx-4 rounded-lg overflow-hidden">
                        <View className="flex-row items-center justify-between p-3 border-b">
                            <Text className="font-semibold text-lg">Select Date</Text>

                            <TouchableOpacity onPress={() => setOpen(false)}>
                                <X />
                            </TouchableOpacity>
                        </View>

                        <Calendar
                            onDayPress={day => {
                                // Prevent selecting blocked dates
                                const selected = new Date(day.dateString);
                                if (isDateBlocked && isDateBlocked(selected)) {
                                    showToast?.('Selected date is blocked. Please choose another date.', 'error');
                                    return;
                                }

                                setDate(day.dateString);
                                setOpen(false);
                            }}
                            markedDates={{
                                ...disabledMap,
                                [date]: { selected: true, selectedColor: '#BE9B7B' },
                            }}
                            // 1. Custom arrow rendering to add the border
                            renderArrow={(direction) => (
                                <View style={{
                                    borderWidth: 1,
                                    borderColor: '#BE9B7B',
                                    borderRadius: 8,
                                    padding: 4,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    {direction === 'left' ?
                                        <ChevronLeft size={18} color="#BE9B7B" /> :
                                        <ChevronRight size={18} color="#BE9B7B" />
                                    }
                                </View>
                            )}
                            // 2. Theme customization for colors and fonts
                            theme={{
                                // Current Day text color
                                todayTextColor: '#BE9B7B',

                                // Month Title Styling (font-semibold)
                                textMonthFontWeight: '800',
                                monthTextColor: '#8B5A3C', // Optional: Fits your app theme better than black

                                // General text styling
                                textDayFontFamily: 'System',
                                textMonthFontFamily: 'System',
                                textDayHeaderFontFamily: 'System',
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default DatePicker