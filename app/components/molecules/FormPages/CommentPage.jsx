import { View, TextInput } from 'react-native';
import FormLabel from '@/components/atoms/FormLabel';
import DatePicker from '@/components/atoms/DatePicker';

const CommentPage = ({ comments, setComments, dueDate, setDueDate }) => (
    <View className='gap-4'>
        <View >
            <FormLabel text={"Comments"} />
            <TextInput
                className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                value={comments}
                onChangeText={setComments}
                placeholder='Do you have specific additions or changes?'
            />
        </View>

        <View >
            <FormLabel text={"Due Date"} />
            <DatePicker onSelectDate={setDueDate} />
        </View>
    </View>
);

export default CommentPage;
