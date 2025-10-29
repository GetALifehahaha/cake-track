import React, {useState} from 'react';
import { ChevronDown, XIcon } from 'lucide-react';

const Dropdown = ({defaultValue=null, selectionName="Option", selections=[{name: "Option 1", value: "Value 1"}, {name: "Option 2", value: "Value 2"}], onSelect}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selected, setSelected] = useState(defaultValue || selectionName);

    const listSelections = selections.map(({name, value}, index) => 
        <div key={index} className='cursor-pointer hover:bg-main-dark px-1 py-2 rounded-sm text-semibold' onClick={() => handleSetSelected(name, value)}>
            <h5>{name}</h5>
        </div>
    )

    const handleSetSelected = (name, value) => {
        setSelected(name)
        onSelect(value)
    }

    const handleSetIsExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className='basis-1/6 relative'>
            <div onClick={handleSetIsExpanded} className='p-3 flex justify-between items-center cursor-pointer bg-accent-mute rounded-md text-main shadow-sm'>
                <h5>{selected}</h5>

                <ChevronDown onClick={handleSetIsExpanded} className={`${(isExpanded) ? 'rotate-180' : ''} duration-200 ease-in `}/>
            </div>

            {isExpanded && 
                <div className='flex flex-col gap-2 bg-main rounded-md absolute mt-2 w-full p-2 shadow-sm'>
                    <div className='cursor-pointer hover:bg-main-dark px-1 py-2 rounded-sm text-medium' onClick={() => handleSetSelected(selectionName, null)}>
                        <h5>{selectionName}</h5>
                    </div>
                    {listSelections}
                </div>
            }
        </div>
    )
}

export default Dropdown;