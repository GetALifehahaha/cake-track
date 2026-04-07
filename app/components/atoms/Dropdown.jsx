// components/Dropdown.js
import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";

const Dropdown = ({ items, placeholder, onChangeValue, defaultValue, zIndex = 1000, zIndexInverse = 1000 }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || null);
  const [dropItems, setDropItems] = useState(items);

  const layerZIndex = open ? zIndex : 0;
  const layerElevation = open ? zIndex : 0;

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
      containerStyle={{
        zIndex: layerZIndex,
        elevation: layerElevation,
      }}
      style={{
        borderColor: "#A67C52",
        backgroundColor: "white",
        borderRadius: 4,
        marginTop: 5,
        zIndex: layerZIndex,
      }}
      dropDownContainerStyle={{
        borderColor: "#A67C52",
        zIndex,
        elevation: zIndex,
      }}
      textStyle={{
        color: "#A67C52"
      }}
    />
  );
};


export default Dropdown;
