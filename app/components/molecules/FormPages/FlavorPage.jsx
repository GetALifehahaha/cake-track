import { View } from 'react-native';
import ModalSelectButton from '@/components/atoms/ModalSelectButton';
import FormLabel from '@/components/atoms/FormLabel';

const FlavorPage = ({ baseFlavor, setBaseFlavor, filling, setFilling }) => (
    <View className='gap-4'>
        <View>
            <FormLabel text={"Base Flavor"} />
            <ModalSelectButton
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                value={baseFlavor}
                placeholder={"Select base flavor"}
                title="Pick Base Flavor"
                subtitle="This is the main taste of your cake sponge."
                onChangeValue={setBaseFlavor}
            />
        </View>

        <View>
            <FormLabel text={"Filling"} />
            <ModalSelectButton
                items={[
                    { label: 'Chocolate', value: 'choco' },
                    { label: 'Strawberry', value: 'strawberry' },
                    { label: 'Vanilla', value: 'vanilla' },
                ]}
                value={filling}
                placeholder={"Select filling"}
                title="Choose Filling"
                subtitle="Select the flavor layered between cake tiers."
                onChangeValue={setFilling}
            />
        </View>
    </View>
);

export default FlavorPage;
