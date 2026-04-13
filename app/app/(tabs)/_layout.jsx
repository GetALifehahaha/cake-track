import { View, Text } from 'react-native'
import { Tabs } from 'expo-router'
import React from 'react'
import { Home, Cake, ShoppingBag, Settings } from 'lucide-react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const _layout = () => {
	const insets = useSafeAreaInsets();

	const TABS = [
		{ name: 'index', title: 'Home', icon: Home },
		{ name: 'orders', title: 'Orders', icon: ShoppingBag },
		{ name: 'cakes', title: 'Cakes', icon: Cake },
		{ name: 'settings', title: 'Settings', icon: Settings },
	]

	return (
		<SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#fff' }}>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarShowLabel: true,
					tabBarStyle: {
						backgroundColor: '#fff',
						height: 58 + Math.max(insets.bottom, 8),
						paddingTop: 8,
						paddingBottom: Math.max(insets.bottom, 8),
						borderTopWidth: 1,
						borderTopColor: '#ececec',
					},
					tabBarItemStyle: {
						paddingVertical: 2,
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