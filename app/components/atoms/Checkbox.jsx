import { Pressable, View } from "react-native";

export default function Checkbox({ value, onChange }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="w-6 h-6 rounded-md border border-secondary-light items-center justify-center"
    >
      {value && <View className="w-4 h-4 bg-primary rounded-sm" />}
    </Pressable>
  );
}
