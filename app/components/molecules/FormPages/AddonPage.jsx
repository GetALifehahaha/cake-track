import { View } from 'react-native';
import ModalSelectButton from '@/components/atoms/ModalSelectButton';
import FormLabel from '@/components/atoms/FormLabel';

const AddonPage = ({ toppings, setToppings, addOn, setAddOn }) => (
    <View className='gap-4'>
        <View>
            <FormLabel text={"Toppings"} />
            <ModalSelectButton
                items={[
                    { label: 'Sprinkles', value: 'sprinkles' },
                    { label: 'None', value: 'none' },
                ]}
                value={toppings}
                placeholder={"Select toppings"}
                title="Select Toppings"
                subtitle="Add finishing details to make your cake pop."
                onChangeValue={setToppings}
            />
        </View>

        <View>
            <FormLabel text={"Add-on"} />
            <ModalSelectButton
                items={[
                    { label: 'Candle', value: 'candle' },
                    { label: 'None', value: 'none' },
                ]}
                value={addOn}
                placeholder={"Select add-on"}
                title="Choose Add-on"
                subtitle="Pick an optional accessory for your cake."
                onChangeValue={setAddOn}
            />
        </View>
    </View>
);

export default AddonPage;
