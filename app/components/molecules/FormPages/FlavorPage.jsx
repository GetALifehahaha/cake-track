import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const FlavorPage = ({ baseFlavor, setBaseFlavor, filling, setFilling }) => (
    <View className='gap-4'>
        <View >
            <FormLabel text={"Base Flavor"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'chocolate' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select base flavor"}
                onChangeValue={setBaseFlavor}
            />
        </View>

        <View >
            <FormLabel text={"Filling"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'chocolate' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Frosting', value: 'frosting' },
                ]}
                placeholder={"Select filling"}
                onChangeValue={setFilling}
            />
        </View>
    </View>
);

export default FlavorPage;
