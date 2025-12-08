import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import FormLabel from '@/components/atoms/FormLabel';
import { Upload, X } from 'lucide-react-native';

const ImagePage = ({ images, pickImage, removeImage }) => {
    
    const renderImageItem = ({ item, index }) => (
        <View className="relative mr-3 mt-2">
            <Image
                source={{ uri: item }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
                resizeMode="cover"
            />
            <TouchableOpacity
                onPress={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 border border-white"
            >
                <X size={12} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View>
            <View>
                <FormLabel text={"Reference Images (optional)"} />
                <Text className='text-secondary-light font-medium mb-2'>
                    Upload up to 5 photos if you want to give reference or recreate a specific design.
                </Text>

                {/* Horizontal List of Selected Images */}
                {images && images.length > 0 && (
                    <View className="h-[120px]">
                        <FlatList
                            data={images}
                            renderItem={renderImageItem}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 5 }}
                        />
                    </View>
                )}

                {/* Upload Button (Hidden if limit reached) */}
                {(images?.length || 0) < 5 && (
                    <TouchableOpacity 
                        onPress={pickImage} 
                        className='bg-white h-[18vh] w-full rounded-md mt-2 border-secondary-light border border-dashed justify-center items-center'
                    >
                        <Upload style={{ color: '#A67C52' }} size={38} />
                        <Text className="text-secondary-strong font-bold mt-2">
                            {images && images.length > 0 ? "Add Another Image" : "Click to upload Image"}
                        </Text>
                        <Text className="text-secondary-light font-medium text-xs">
                            ({images?.length || 0}/5) PNG, JPG up to 10MB
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default ImagePage;