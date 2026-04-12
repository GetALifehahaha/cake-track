import { View, Text, TextInput } from 'react-native';
import ModalSelectButton from '@/components/atoms/ModalSelectButton';
import FormLabel from '@/components/atoms/FormLabel';

const FormPage = ({ shape, setShape, specifyShape, setSpecifyShape, tier, setTier }) => (
    <View className='gap-4'>
        <View className=''>
            <FormLabel text={"Shape"} />
            <ModalSelectButton
                items={[
                    { label: 'Round', value: 'round' },
                    { label: 'Sheet', value: 'sheet' },
                    { label: 'Other', value: 'other' },
                ]}
                value={shape}
                placeholder={"Select shape"}
                title="Choose Cake Shape"
                subtitle="Select the base form for your cake design."
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
            <ModalSelectButton
                items={[
                    { label: 'Single Tier', value: 1 },
                    { label: 'Double Tier', value: 2 },
                    { label: 'Triple Tier', value: 3 },
                ]}
                value={tier}
                placeholder={"Select a tier"}
                title="Select Cake Tier"
                subtitle="Higher tiers create a taller, more dramatic cake."
                onChangeValue={setTier}
            />
        </View>
    </View>
);

export default FormPage;
