import { View, Text, TextInput } from 'react-native';
import Checkbox from '@/components/atoms/Checkbox';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';
import { AlertCircle } from 'lucide-react-native';

const CakeDetailPage = ({ occasion, setOccasion, specifyOccasion, setSpecifyOccasion, personallyDesign, setPersonallyDesign }) => (
    <View>
        <View className='p-8'>
            <FormLabel text={"Occassion"} />
            <Dropdown
                items={[
                    { label: 'Birthday', value: 'birthday' },
                    { label: 'Anniversary', value: 'anniversary' },
                    { label: 'Wedding', value: 'wedding' },
                    { label: 'Graduation', value: 'graduation' },
                    { label: 'Other', value: 'other' },
                ]}
                placeholder={"Select an occasion"}
                onChangeValue={setOccasion}
            />
            {occasion == 'other' && (
                <TextInput
                    className='py-5 px-2 rounded-md border border-secondary-light mt-4'
                    value={specifyOccasion}
                    onChangeText={setSpecifyOccasion}
                    placeholder='Specify your occassion'
                />
            )}
        </View>

        <View className='px-8'>
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
