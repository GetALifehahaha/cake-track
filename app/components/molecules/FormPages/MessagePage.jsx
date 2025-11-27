import { View, TextInput } from 'react-native';
import Dropdown from './Dropdown';
import FormLabel from './FormLabel';

const MessagePage = ({ messageType, setMessageType, message, setMessage }) => (
    <View>
        <View className='p-8'>
            <FormLabel text={"Message Type"} />
            <Dropdown
                items={[
                    { label: 'On Cake (Icing Writing)', value: 'on_cake' },
                    { label: 'On Card (Message Card)', value: 'on_card' },
                    { label: 'No Message', value: 'none' },
                ]}
                placeholder={"Select message type"}
                onChangeValue={setMessageType}
            />
        </View>

        <View className='p-8'>
            <FormLabel text={"Message"} />
            <TextInput
                multiline
                numberOfLines={4}
                className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                value={message}
                onChangeText={setMessage}
                placeholder='What should the message say?'
            />
        </View>
    </View>
);

export default MessagePage;
