import { View, Text, TextInput } from 'react-native';
import ModalSelectButton from '@/components/atoms/ModalSelectButton';
import FormLabel from '@/components/atoms/FormLabel';
import Checkbox from '@/components/atoms/Checkbox';

const CupcakePage = ({ hasCupcakes, toggleHasCupcakes, cupcakesCount, setCupcakesCount, cupcakesFrosting, setCupcakesFrosting }) => (
    <View className='gap-4'>
        <View>
            <FormLabel text={"Add cupcakes?"} />
            <View className='flex-row gap-2 items-center'>
                <Checkbox value={hasCupcakes} onChange={toggleHasCupcakes} />
                <Text className='text-primary font-semibold'>Yes</Text>
                <Checkbox value={!hasCupcakes} onChange={toggleHasCupcakes} />
                <Text className='text-primary font-semibold'>No</Text>
            </View>
        </View>

        <View pointerEvents={hasCupcakes ? "auto" : "none"} style={{ opacity: hasCupcakes ? 1 : 0.5 }} className='mt-2'>
            <View className='p-6 border border-secondary-light rounded-md gap-2'>
                <View>
                    <FormLabel text={"How many cupcakes?"} />
                    <TextInput
                        keyboardType='numeric'
                        className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                        value={cupcakesCount}
                        onChangeText={setCupcakesCount}
                        placeholder='e.g., 12'
                    />
                </View>
                <View>
                    <FormLabel text={"Frosting"} />
                    <ModalSelectButton
                        items={[
                            { label: 'White', value: 'white' },
                            { label: 'Black', value: 'black' },
                            { label: 'Red', value: 'red' },
                            { label: 'Blue', value: 'blue' },
                            { label: 'Yellow', value: 'yellow' },
                        ]}
                        value={cupcakesFrosting}
                        placeholder={"Select frosting color"}
                        title="Select Frosting Color"
                        subtitle="Choose cupcake frosting to match your cake theme."
                        onChangeValue={setCupcakesFrosting}
                    />
                </View>
            </View>
        </View>
    </View>
);

export default CupcakePage;
