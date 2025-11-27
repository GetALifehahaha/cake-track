import { View } from 'react-native';
import Dropdown from '@/components/atoms/Dropdown';
import FormLabel from '@/components/atoms/FormLabel';

const CoatingPage = ({ coatingColor, setCoatingColor, border, setBorder, borderColor, setBorderColor }) => (
    <View className='gap-4'>
        <View>
            <FormLabel text={"Coating Color"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select coating color"}
                onChangeValue={setCoatingColor}
            />
        </View>
        <View>
            <FormLabel text={"Border"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select border"}
                onChangeValue={setBorder}
            />
        </View>
        <View>
            <FormLabel text={"Border Color"} />
            <Dropdown
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                placeholder={"Select border color"}
                onChangeValue={setBorderColor}
            />
        </View>
    </View>
);

export default CoatingPage;
