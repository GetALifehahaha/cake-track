import { View, TextInput } from 'react-native';
import ModalSelectButton from '@/components/atoms/ModalSelectButton';
import FormLabel from '@/components/atoms/FormLabel';
import { useRef } from 'react';

const MessagePage = ({ messageType, setMessageType, message, setMessage }) => {
    const inputRef = useRef(null);

    const handleMessageTypeChange = (val) => {
        setMessageType(val);
        // If "none" is selected, clear the message and blur the input
        if (val === 'none') {
            setMessage('');
            inputRef.current?.blur();
        }
    };

    return (
        <View className='gap-4'>
            <View>
                <FormLabel text={"Message Type"} />
                <ModalSelectButton
                    items={[
                        { label: 'On Cake (Icing Writing)', value: 'on_cake' },
                        { label: 'On Card (Message Card)', value: 'on_card' },
                        { label: 'On Both', value: 'on_both' },
                        { label: 'No Message', value: 'none' },
                    ]}
                    value={messageType}
                    placeholder={"Select message type"}
                    title="Choose Message Placement"
                    subtitle="Pick where your custom message should appear."
                    onChangeValue={handleMessageTypeChange}
                />
            </View>

            <View pointerEvents={messageType === "none" ? "none" : "auto"} style={{ opacity: messageType === "none" ? 0.5 : 1, zIndex: 1000 }}>
                <FormLabel text={"Message"} />
                <TextInput
                    ref={inputRef}
                    multiline={true}
                    numberOfLines={4}
                    editable={messageType !== "none"}
                    style={{ textAlignVertical: 'top' }}
                    className='h-32 py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                    value={message}
                    onChangeText={setMessage}
                    placeholder='What should the message say?'
                />
            </View>
        </View>
    );
};

export default MessagePage;
