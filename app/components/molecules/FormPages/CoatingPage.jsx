import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const CoatingPage = ({ coatingColor, setCoatingColor, border, setBorder, borderColor, setBorderColor }) => (
    <View className='gap-4'>
        <View style={{ zIndex: 3000 }}>
            <FormLabel text={"Coating Color"} />
            <Dropdown
                items={[
                    { label: 'White', value: 'white' },
                    { label: 'Black', value: 'black' },
                    { label: 'Red', value: 'red' },
                    { label: 'Blue', value: 'blue' },
                    { label: 'Yellow', value: 'yellow' },
                    { label: 'Purple', value: 'purple' },
                ]}
                placeholder={"Select coating color"}
                onChangeValue={setCoatingColor}
                zIndex={3000}
                zIndexInverse={1000}
            />
        </View>
        <View style={{ zIndex: 2000 }}>
            <FormLabel text={"Border"} />
            <Dropdown
                items={[
                    { label: 'Drip', value: 'drip' },
                    { label: 'Frosting Pipe', value: 'piping' },
                ]}
                placeholder={"Select border"}
                onChangeValue={setBorder}
                zIndex={2000}
                zIndexInverse={2000}
            />
        </View>
        <View style={{ zIndex: 1000 }}>
            <FormLabel text={"Border Color"} />
            <Dropdown
                items={[
                    { label: 'White', value: 'white' },
                    { label: 'Black', value: 'black' },
                    { label: 'Red', value: 'red' },
                    { label: 'Blue', value: 'blue' },
                    { label: 'Yellow', value: 'yellow' },
                    { label: 'Purple', value: 'purple' },
                ]}
                placeholder={"Select border color"}
                onChangeValue={setBorderColor}
                zIndex={1000}
                zIndexInverse={3000}
            />
        </View>
    </View>
);

export default CoatingPage;
