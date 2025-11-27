import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Calendar1, X } from 'lucide-react-native';
import { Modal } from "react-native";
import { Calendar } from 'react-native-calendars';


const DatePicker = ({ onSelectDate }) => {

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(null);

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
                                setDate(day.dateString);
                                setOpen(false);
                            }}
                            markedDates={{
                                [date]: { selected: true, selectedColor: '#BE9B7B' },
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default DatePicker