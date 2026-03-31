import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const FlavorPage = ({ baseFlavor, setBaseFlavor, filling, setFilling }) => (
    <View className='gap-4'>
        <View style={{ zIndex: 2000 }}>
            <FormLabel text={"Base Flavor"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'straw' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select base flavor"}
                onChangeValue={setBaseFlavor}
                zIndex={2000}
                zIndexInverse={1000}
            />
        </View>

        <View style={{ zIndex: 1000 }}>
            <FormLabel text={"Filling"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select filling"}
                onChangeValue={setFilling}
                zIndex={1000}
                zIndexInverse={2000}
            />
        </View>
    </View>
);

export default FlavorPage;
