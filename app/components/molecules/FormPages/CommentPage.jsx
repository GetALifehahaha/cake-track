import { View, TextInput } from 'react-native';
import FormLabel from '@/components/atoms/FormLabel';
import DatePicker from '@/components/atoms/DatePicker';
import TimePicker from '@/components/atoms/TimePicker';

const CommentPage = ({ comments, setComments, dueDate, setDueDate, pickupTime, setPickupTime }) => (
    <View className='gap-4'>
        <View >
            <FormLabel text={"Comments"} />
            <TextInput
                multiline={true}
                numberOfLines={4}
                style={{ textAlignVertical: 'top' }}
                className='h-32 py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                value={comments}
                onChangeText={setComments}
                placeholder='Do you have specific additions or changes?'
            />
        </View>

        <View >
            <FormLabel text={"Pickup Date"} />
            <DatePicker onSelectDate={setDueDate} />
        </View>
        <View >
            <FormLabel text={"Pickup Time"} />
            <TimePicker onSelectTime={setPickupTime} />
        </View>
    </View>
);

export default CommentPage;
