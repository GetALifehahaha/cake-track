import { View, TextInput } from 'react-native';
import FormLabel from './FormLabel';
import DatePicker from './DatePicker';

const CommentPage = ({ comments, setComments, dueDate, setDueDate }) => (
    <View>
        <View className='p-8'>
            <FormLabel text={"Comments"} />
            <TextInput
                className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                value={comments}
                onChangeText={setComments}
                placeholder='Do you have specific additions or changes?'
            />
        </View>

        <View className='px-8 mt-4'>
            <FormLabel text={"Due Date"} />
            <DatePicker onSelectDate={setDueDate} />
        </View>
    </View>
);

export default CommentPage;
