import { View, TextInput } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const MessagePage = ({ messageType, setMessageType, message, setMessage }) => (
    <View className='gap-4'>
        <View style={{ zIndex: 2000 }}>
            <FormLabel text={"Message Type"} />
            <Dropdown
                items={[
                    { label: 'On Cake (Icing Writing)', value: 'on_cake' },
                    { label: 'On Card (Message Card)', value: 'on_card' },
                    { label: 'On Both', value: 'on_both' },
                    { label: 'No Message', value: 'none' },
                ]}
                placeholder={"Select message type"}
                onChangeValue={setMessageType}
                zIndex={2000}
                zIndexInverse={1000}
            />
        </View>

        <View pointerEvents={messageType === "none" ? "none" : "auto"} style={{ opacity: messageType === "none" ? 0.5 : 1, zIndex: 1000 }}>
            <FormLabel text={"Message"} />
            <TextInput
                multiline={true}
                numberOfLines={4}
                style={{ textAlignVertical: 'top' }}
                className='h-32 py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                value={message}
                onChangeText={setMessage}
                placeholder='What should the message say?'
            />
        </View>
    </View>
);

export default MessagePage;
