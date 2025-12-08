import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ImagePreview = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { uri } = params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X color="white" size={30} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: uri }} 
                    style={styles.image} 
                    resizeMode="contain" 
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height,
    }
});

export default ImagePreview;