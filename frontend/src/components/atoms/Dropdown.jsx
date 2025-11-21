import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Dropdown = ({selection, value, variant="block", size="fit", options=[{Option: 'option'}], forPageFilter=false, onSelect}) => {

    const variants = {
        outline: 'bg-main border-main-dark text-text/50',
        block: 'bg-accent',
        modal: 'bg-border/50 text-text outline-none border-none placeholder:text-text/50'
    }

    const sizes = {
        full: 'w-full',
        fit: 'w-fit',
        regular: 'w-[140px]'
    }

    const capitalize = (str) => str ? str[0].toUpperCase() + str.slice(1) : str;

    const listOptions = options.map(({key, value}, index) => <SelectItem key={index} value={forPageFilter ? key : value}>{capitalize(key)}</SelectItem>)

    return (
        <Select 
            value={value || ""}
            onValueChange={(val) => {
            if (onSelect) onSelect(val);
        }}>
            <SelectTrigger className={`${variants[variant]} ${sizes[size]}`}>
                <SelectValue placeholder={selection} />
            </SelectTrigger>
            <SelectContent className='right-0'>
                {listOptions}
                <SelectItem value={null} className='text-black/60 font-semibold'>Remove Filter</SelectItem>
            </SelectContent>
        </Select>
    )
}

export default Dropdown;