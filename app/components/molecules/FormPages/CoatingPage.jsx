import { View } from 'react-native';
import ModalSelectButton from '@/components/atoms/ModalSelectButton';
import FormLabel from '@/components/atoms/FormLabel';

const CoatingPage = ({ coatingColor, setCoatingColor, border, setBorder, borderColor, setBorderColor }) => {
    const handleBorderChange = (value) => {
        setBorder(value);

        if ((value === 'drip' || value === 'piping') && !borderColor) {
            setBorderColor('white');
        }
    };

    return (
        <View className='gap-4'>
            <View>
                <FormLabel text={"Coating Color"} />
                <ModalSelectButton
                    items={[
                        { label: 'White', value: 'white' },
                        { label: 'Black', value: 'black' },
                        { label: 'Red', value: 'red' },
                        { label: 'Blue', value: 'blue' },
                        { label: 'Yellow', value: 'yellow' },
                        { label: 'Purple', value: 'purple' },
                    ]}
                    value={coatingColor}
                    placeholder={"Select coating color"}
                    title="Select Coating Color"
                    subtitle="This color controls your cake's main outside look."
                    onChangeValue={setCoatingColor}
                />
            </View>
            <View>
                <FormLabel text={"Border"} />
                <ModalSelectButton
                    items={[
                        { label: 'Drip', value: 'drip' },
                        { label: 'Frosting Pipe', value: 'piping' },
                    ]}
                    value={border}
                    placeholder={"Select border"}
                    title="Choose Border Style"
                    subtitle="Pick how the edges should be decorated."
                    onChangeValue={handleBorderChange}
                />
            </View>
            <View>
                <FormLabel text={"Border Color"} />
                <ModalSelectButton
                    items={[
                        { label: 'White', value: 'white' },
                        { label: 'Black', value: 'black' },
                        { label: 'Red', value: 'red' },
                        { label: 'Blue', value: 'blue' },
                        { label: 'Yellow', value: 'yellow' },
                        { label: 'Purple', value: 'purple' },
                    ]}
                    value={borderColor}
                    placeholder={"Select border color"}
                    title="Pick Border Color"
                    subtitle="Choose the color used for your selected border style."
                    onChangeValue={setBorderColor}
                />
            </View>
        </View>
    );
};

export default CoatingPage;
