import { View, Text, TextInput } from 'react-native';
import Checkbox from '@/components/atoms/Checkbox';
import ModalSelectButton from '@/components/atoms/ModalSelectButton';
import FormLabel from '@/components/atoms/FormLabel';
import { AlertCircle } from 'lucide-react-native';

const CakeDetailPage = ({ occasion, setOccasion, specifyOccasion, setSpecifyOccasion, personallyDesign, setPersonallyDesign }) => (
    <View className='gap-4'>
        <View className=''>
            <FormLabel text={"Occassion"} />
            <ModalSelectButton
                items={[
                    { label: 'Birthday', value: 'birthday' },
                    { label: 'Anniversary', value: 'anniversary' },
                    { label: 'Wedding', value: 'wedding' },
                    { label: 'Graduation', value: 'graduation' },
                    { label: 'Other', value: 'other' },
                ]}
                value={occasion}
                placeholder={"Select an occasion"}
                title="Pick an Occasion"
                subtitle="Tell us what this cake is for so we can guide the style."
                onChangeValue={setOccasion}
            />
            {occasion == 'other' && (
                <TextInput
                    className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                    value={specifyOccasion}
                    onChangeText={setSpecifyOccasion}
                    placeholder='Specify your occassion'
                />
            )}
        </View>

        <View className=''>
            <View className='p-4 gap-4 border border-secondary-light bg-white rounded-md'>
                <View className='flex-row gap-2'>
                    <Checkbox value={personallyDesign} onChange={setPersonallyDesign} />
                    <Text className='font-medium text-secondary-strong'>Allow the baker to personally design your cake</Text>
                </View>

                <View className='bg-main-form flex-row items-center p-4 gap-2 rounded-sm border border-secondary-light'>
                    <AlertCircle style={{ color: "#8B5A3C" }} />
                    <Text className='text-secondary-strong text-sm'>
                        Selecting this gives the baker artistic freedom to personalize your cake based on the occassion
                    </Text>
                </View>
            </View>
        </View>
    </View>
);

export default CakeDetailPage;
