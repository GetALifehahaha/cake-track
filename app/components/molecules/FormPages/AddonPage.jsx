import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const AddonPage = ({ toppings, setToppings, addOn, setAddOn }) => (
    <View className='gap-4'>
        <View style={{ zIndex: 2000 }}>
            <FormLabel text={"Toppings"} />
            <Dropdown
                items={[
                    { label: 'Sprinkles', value: 'sprinkles' },
                ]}
                placeholder={"Select toppings"}
                onChangeValue={setToppings}
                zIndex={2000}
                zIndexInverse={1000}
            />
        </View>

        <View style={{ zIndex: 1000 }}>
            <FormLabel text={"Add-on"} />
            <Dropdown
                items={[
                    { label: 'Candle', value: 'candle' },
                ]}
                placeholder={"Select add-on"}
                onChangeValue={setAddOn}
                zIndex={1000}
                zIndexInverse={2000}
            />
        </View>
    </View>
);

export default AddonPage;
