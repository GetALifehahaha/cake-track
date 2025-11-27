import { View, Text, TextInput } from 'react-native';
import Checkbox from './Checkbox';
import FormLabel from './FormLabel';

const InformationPage = ({ fullName, setFullName, address, setAddress, email, setEmail, contactNumber, setContactNumber, personallyDesign, setPersonallyDesign }) => (
    <View className='px-8 gap-0.5'>
        <View>
            <FormLabel text={"Full Name"} />
            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={fullName} onChangeText={setFullName} placeholder='Juan Dela Cruz' />
        </View>
        <View>
            <FormLabel text={"Address"} />
            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={address} onChangeText={setAddress} placeholder='123 Main St. City, Province' />
        </View>
        <View>
            <FormLabel text={"Email"} />
            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={email} onChangeText={setEmail} placeholder='juan@gmail.com' />
        </View>
        <View>
            <FormLabel text={"Phone Number"} />
            <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={contactNumber} onChangeText={setContactNumber} placeholder='+63 912 345 6789' />
        </View>
        <View className='flex-row mt-2 gap-4 px-4 py-4 rounded-lg border border-secondary-light items-center'>
            <Checkbox value={personallyDesign} onChange={setPersonallyDesign} />
            <Text className='font-medium text-secondary-strong'>I agree to the terms and conditions, including the down payment required</Text>
        </View>
    </View>
);

export default InformationPage;
