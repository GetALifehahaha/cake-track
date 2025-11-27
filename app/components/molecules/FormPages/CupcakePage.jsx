import { View, Text, TextInput } from 'react-native';
import Dropdown from './Dropdown';
import FormLabel from './FormLabel';
import Checkbox from './Checkbox';

const CupcakePage = ({ hasCupcakes, toggleHasCupcakes, cupcakesCount, setCupcakesCount, addOn, setAddOn }) => (
    <View className='px-8'>
        <View className='mt-4'>
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
                        className='py-5 px-3 rounded-md border border-secondary-light mt-4 bg-white'
                        value={cupcakesCount}
                        onChangeText={setCupcakesCount}
                        placeholder='e.g., 12'
                    />
                </View>
                <View>
                    <FormLabel text={"Add-on"} />
                    <Dropdown
                        items={[
                            { label: 'Nuts', value: 'nuts' },
                            { label: 'Chocolate Chips', value: 'chocolate_chips' },
                            { label: 'Caramel Drizzle', value: 'caramel_drizzle' },
                        ]}
                        placeholder={"Select add-on"}
                        onChangeValue={setAddOn}
                    />
                </View>
            </View>
        </View>
    </View>
);

export default CupcakePage;
