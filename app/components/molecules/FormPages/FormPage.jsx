import { View, Text, TextInput } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import SelectionGrid from '@/components/atoms/SelectionGrid';
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
                    className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                    value={specifyShape}
                    onChangeText={setSpecifyShape}
                    placeholder='Specify your shape'
                />
            )}
        </View>

        <View className=''>
            <FormLabel text={"Cake Tier"} />
            <SelectionGrid
                items={[
                    { label: '1', value: 1 },
                    { label: '2', value: 2 },
                    { label: '3', value: 3 },
                ]}
                placeholder={"Select a tier"}
                onChangeValue={setTier}
                defaultValue={tier}
            />
        </View>
    </View>
);

export default FormPage;
