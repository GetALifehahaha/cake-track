import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const FlavorPage = ({ baseFlavor, setBaseFlavor, filling, setFilling }) => (
    <View>
        <View className='p-8'>
            <FormLabel text={"Base Flavor"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select base flavor"}
                onChangeValue={setBaseFlavor}
            />
        </View>

        <View className='p-8'>
            <FormLabel text={"Filling"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select filling"}
                onChangeValue={setFilling}
            />
        </View>
    </View>
);

export default FlavorPage;
