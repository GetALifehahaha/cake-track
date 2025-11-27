import { View, Text, TouchableOpacity, Image } from 'react-native';
import FormLabel from '@/components/atoms/FormLabel';
import { Upload } from 'lucide-react-native';

const ImagePage = ({ image, pickImage }) => (
    <View className=''>
        <View>
            <FormLabel text={"Reference Image (optional)"} />
            <Text className='text-secondary-light font-medium'>
                Upload a photo if you want to give reference or recreate a specific design
            </Text>

            <TouchableOpacity onPress={pickImage} className='bg-white h-[20vh] w-full rounded-md mt-2 border-secondary-light border justify-center items-center'>
                {image ? (
                    <Image
                        source={{ uri: image }}
                        style={{
                            height: 150,
                            width: 300,
                        }}
                        resizeMode="contain"
                    />
                ) : (
                    <>
                        <Upload style={{ color: '#A67C52' }} size={38} />
                        <Text className="text-secondary-strong font-bold">Click to upload Image</Text>
                        <Text className="text-secondary-light font-medium">PNG, JPG up to 10MB</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    </View>
);

export default ImagePage;
