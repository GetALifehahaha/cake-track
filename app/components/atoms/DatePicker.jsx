import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Calendar1, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Modal } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useOpening } from '@/context/OpeningContext';
import { useToast } from '@/context/ToastContext';


const DatePicker = ({ onSelectDate, maxMonthsAhead = 3 }) => {

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(null);
    const { blockedDates, isDateBlocked } = useOpening();
    const { showToast } = useToast();
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const minimumPickupDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const maxDate = new Date(today.getFullYear(), today.getMonth() + maxMonthsAhead, today.getDate());
    const maximumPickupDate = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

    // Build markedDates map for disabled days
    const buildDisabledMap = () => {
        const map = {};
        if (!blockedDates || !blockedDates.length) return map;

        // Work with YYYY-MM-DD strings to avoid timezone shifts
        const toDateStr = (val) => {
            if (!val) return null;
            // If already a YYYY-MM-DD string, use it directly
            if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
            // Otherwise extract the date part (handles ISO strings like "2026-03-30T00:00:00Z")
            const str = typeof val === 'string' ? val : val.toISOString();
            return str.split('T')[0];
        };

        const addDay = (dateStr) => {
            // Increment a YYYY-MM-DD string by one day without timezone issues
            const [y, m, d] = dateStr.split('-').map(Number);
            const next = new Date(y, m - 1, d + 1); // local date arithmetic
            return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
        };

        const markDisabled = (dateStr) => {
            map[dateStr] = { disabled: true, disableTouchEvent: true, marked: true, selected: false };
        };

        for (const bd of blockedDates) {
            if (!bd) continue;
            if (typeof bd === 'string') {
                const ds = toDateStr(bd);
                if (ds) markDisabled(ds);
            } else if (bd.start_date || bd.end_date || bd.start || bd.end) {
                const startStr = toDateStr(bd.start_date ?? bd.start);
                const endStr = toDateStr(bd.end_date ?? bd.end ?? bd.start_date);
                if (startStr && endStr) {
                    let cur = startStr;
                    while (cur <= endStr) {
                        markDisabled(cur);
                        cur = addDay(cur);
                    }
                }
            } else if (bd.date) {
                const ds = toDateStr(bd.date);
                if (ds) markDisabled(ds);
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
                                if (day.dateString <= todayDateString) {
                                    showToast?.('Pickup date must be after today.', 'error');
                                    return;
                                }

                                if (day.dateString > maximumPickupDate) {
                                    showToast?.('Pickup date cannot be more than 3 months from today.', 'error');
                                    return;
                                }

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
                            minDate={minimumPickupDate}
                            maxDate={maximumPickupDate}
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