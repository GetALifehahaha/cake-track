import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const AddonPage = ({ toppings, setToppings, addOn, setAddOn }) => (
    <View className='gap-4'>
        <View>
            <FormLabel text={"Toppings"} />
            <Dropdown
                items={[
                    { label: 'Sprinkles', value: 'sprinkles' },
                ]}
                placeholder={"Select toppings"}
                onChangeValue={setToppings}
            />
        </View>

        <View>
            <FormLabel text={"Add-on"} />
            <Dropdown
                items={[
                    { label: 'Candle', value: 'candle' },
                ]}
                placeholder={"Select add-on"}
                onChangeValue={setAddOn}
            />
        </View>
    </View>
);

export default AddonPage;
