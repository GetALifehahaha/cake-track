import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const AddonPage = ({ toppings, setToppings, addOn, setAddOn }) => (
    <View className='gap-4'>
        <View>
            <FormLabel text={"Toppings"} />
            <Dropdown
                items={[
                    { label: 'Whipped Cream', value: 'whipped_cream' },
                    { label: 'Fresh Fruits', value: 'fresh_fruits' },
                    { label: 'Chocolate Ganache', value: 'chocolate_ganache' },
                    { label: 'Buttercream Frosting', value: 'buttercream_frosting' },
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
                    { label: 'Nuts', value: 'nuts' },
                    { label: 'Chocolate Chips', value: 'chocolate_chips' },
                    { label: 'Caramel Drizzle', value: 'caramel_drizzle' },
                ]}
                placeholder={"Select add-on"}
                onChangeValue={setAddOn}
            />
        </View>
    </View>
);

export default AddonPage;
