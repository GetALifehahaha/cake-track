import { View, Text } from 'react-native'
import { Tabs } from 'expo-router'
import React from 'react'
import { User, Home, Cake, ShoppingBag } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const _layout = () => {

	const TABS = [
		{ name: 'index', title: 'Home', icon: Home },
		{ name: 'orders', title: 'Orders', icon: ShoppingBag },
		{ name: 'cakes', title: 'Cakes', icon: Cake },
		{ name: 'account', title: 'Account', icon: User },
	]

	return (
		<SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarShowLabel: true,
					tabBarStyle: {
						backgroundColor: '#fff',
					},
					tabBarActiveTintColor: '#8B5A3C',
					tabBarInactiveTintColor: '#99A1AF'
				}}
			>
				{TABS.map((tab) => (
					<Tabs.Screen
						key={tab.name}
						name={tab.name}
						options={{
							title: tab.title,
							tabBarIcon: ({ focused }) => {
								const Icon = tab.icon
								return (
									<View>
										<Icon color={focused ? '#8B5A3C' : '#99A1AF'} size={24} />
									</View>
								)
							}
						}}
					/>
				)
				)
				}
			</Tabs>
		</SafeAreaView>
	)
}

export default _layout