import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import Checkbox from '@/components/atoms/Checkbox';
import FormLabel from '@/components/atoms/FormLabel';

const InformationPage = ({ fullName, setFullName, address, setAddress, email, setEmail, contactNumber, setContactNumber, agreeToTOC, setAgreeToTOC, returnTo }) => {
    const router = useRouter();

    return (
        <View className='gap-4'>
            <View>
                <FormLabel text={"Full Name"} />
                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={fullName} onChangeText={setFullName} placeholder='Juan Dela Cruz' />
            </View>
            <View>
                <FormLabel text={"Address"} />
                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={address} onChangeText={setAddress} placeholder='123 Main St. City, Province' />
                <TouchableOpacity
                    className='flex-row items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-secondary-light/10 border border-secondary-light/30 self-start'
                    onPress={() => router.push({ pathname: '/locationPicker', params: { currentAddress: address, returnTo: returnTo || '/customOrders' } })}
                >
                    <MapPin size={16} style={{ color: '#8B5A3C' }} />
                    <Text className='text-primary font-medium text-sm'>Pick from saved locations</Text>
                </TouchableOpacity>
            </View>
            <View>
                <FormLabel text={"Email"} />
                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={email} onChangeText={setEmail} placeholder='juan@gmail.com' />
            </View>
            <View>
                <FormLabel text={"Phone Number"} />
                <TextInput className='py-2 px-3 rounded-md border border-secondary-light mt-1 bg-white' value={contactNumber} onChangeText={setContactNumber} placeholder='+639123456789 or 09123456789' maxLength={18} />
            </View>
            <View className='flex-row mt-2 gap-4 px-4 py-4 rounded-lg border border-secondary-light items-center'>
                <Checkbox value={agreeToTOC} onChange={setAgreeToTOC} />
                <Text className='font-medium text-secondary-strong w-4/5'>I agree to the terms and conditions, including the down payment required</Text>
            </View>
        </View>
    );
};

export default InformationPage;
