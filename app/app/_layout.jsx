import "./global.css";
import { Stack } from "expo-router";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
        />
        <Stack.Screen
          name="customOrders"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="cakeOrders"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>
    </CartProvider>
  )
}
