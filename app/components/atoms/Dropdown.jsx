// components/Dropdown.js
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { View } from "lucide-react-native";

const Dropdown = ({ items, placeholder, onChangeValue, defaultValue }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || null);
  const [dropItems, setDropItems] = useState(items);

  const handleValueChange = (val) => {
    setValue(val);
    if (onChangeValue) onChangeValue(val);
  };

  return (
    <DropDownPicker
    open={open}
    value={value}
    items={dropItems}
    setOpen={setOpen}
    setValue={handleValueChange}
    setItems={setDropItems}
    placeholder={placeholder}
    style={{
        borderColor: "#A67C52",
        backgroundColor: "white",
        borderRadius: 4,
        zIndex: 1000,
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
