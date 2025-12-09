import { View, Text } from 'react-native'
import React from 'react'
import LoginSignup from '@/components/organisms/LoginSignup'

const login = () => {
    return (
        <LoginSignup method={'login'} />
    )
}

export default login