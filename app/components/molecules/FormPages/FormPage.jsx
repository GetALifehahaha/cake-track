import { View, Text, TextInput } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const FormPage = ({ shape, setShape, specifyShape, setSpecifyShape, tier, setTier }) => (
    <View className='gap-4'>
        <View className=''>
            <FormLabel text={"Shape"} />
            <Dropdown
                items={[
                    { label: 'Round', value: 'round' },
                    { label: 'Sheet', value: 'sheet' },
                    { label: 'Other', value: 'other' },
                ]}
                placeholder={"Select shape"}
                onChangeValue={setShape}
            />
            {shape == 'other' && (
                <TextInput
                    className='py-5 px-2 rounded-md border border-secondary-light mt-4'
                    value={specifyShape}
                    onChangeText={setSpecifyShape}
                    placeholder='Specify your shape'
                />
            )}
        </View>

        <View className=''>
            <FormLabel text={"Cake Tier"} />
            <Dropdown
                items={[
                    { label: '1-Tier', value: 1 },
                    { label: '2-Tier', value: 2 },
                    { label: '3-Tier', value: 3 },
                ]}
                placeholder={"Select tier"}
                onChangeValue={setTier}
            />
        </View>
    </View>
);

export default FormPage;
