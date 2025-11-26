import { View, Text, Image } from 'react-native'
import React from 'react'

const CakeCard = ({ image, text }) => {
    return (
        <View className='aspect-square h-[20vh] w-[40vw] items-center'>

            <Image source={image} resizeMode={'contain'} style={{ height: '80%', aspectRatio: 1 / 1 }} />
            <Text className='font-bold text-center mt-2'>{text}</Text>
        </View>
    )
}

export default CakeCard