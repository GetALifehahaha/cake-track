// components/Dropdown.js
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { View } from "lucide-react-native";

const Dropdown = ({ items, placeholder, onChangeValue, defaultValue, zIndex = 1000, zIndexInverse = 1000 }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || null);
  const [dropItems, setDropItems] = useState(items);

  const handleValueChange = (val) => {
    setValue(val);
    if (onChangeValue) onChangeValue(val);
  };

  return (
    <DropDownPicker
      listMode="SCROLLVIEW"
      scrollViewProps={{
        nestedScrollEnabled: true,
      }}
      open={open}
      value={value}
      items={dropItems}
      setOpen={setOpen}
      setValue={handleValueChange}
      setItems={setDropItems}
      placeholder={placeholder}
      zIndex={zIndex}
      zIndexInverse={zIndexInverse}
      style={{
        borderColor: "#A67C52",
        backgroundColor: "white",
        borderRadius: 4,
        marginTop: 5
      }}
      dropDownContainerStyle={{
        borderColor: "#A67C52",
      }}
      textStyle={{
        color: "#A67C52"
      }}
    />
  );
};


export default Dropdown;
