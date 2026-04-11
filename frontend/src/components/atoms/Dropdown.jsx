import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Dropdown = ({selection, value, variant="block", size="fit", options=[{Option: 'option'}], forPageFilter=false, onSelect, removeText="None", allowNone=true}) => {

    const variants = {
        outline: 'bg-main border-main-dark text-text/50',
        block: 'bg-accent',
        modal: 'bg-border/50 text-text outline-none border-none placeholder:text-text/50',
        white: 'bg-main-white shadow-sm text-text border-none font-medium'
    }

    const sizes = {
        full: 'w-full',
        fit: 'w-fit',
        regular: 'w-[140px]',
        'height-full': 'h-full'
    }

    const capitalize = (str) => str ? str[0].toUpperCase() + str.slice(1) : str;

    const normalizedValue = value === null || value === undefined ? "" : String(value);

    const listOptions = options.map(({key, value}, index) => (
        <SelectItem key={index} value={String(forPageFilter ? key : value)}>
            <span className='block truncate'>{capitalize(key)}</span>
        </SelectItem>
    ))

    return (
        <Select 
            value={normalizedValue}
            onValueChange={(val) => {
            if (onSelect) onSelect(val === "__none__" ? null : val);
        }}>
            <SelectTrigger className={`${variants[variant]} ${sizes[size]} min-w-0`}>
                <SelectValue placeholder={selection} className='truncate' />
            </SelectTrigger>
            <SelectContent className='right-0'>
                {listOptions}
                {allowNone && <SelectItem value="__none__" className='text-black/60 font-medium'>{removeText}</SelectItem>}
            </SelectContent>
        </Select>
    )
}

export default Dropdown;