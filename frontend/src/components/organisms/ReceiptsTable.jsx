import React, {memo} from 'react';
import { Title } from '../atoms';
import { Ellipsis } from 'lucide-react';

const ReceiptsTable = memo(({headers=['id', 'name', 'number'], content=[{}]}) => {

    const capitalize = (string) => {
        if (string) return string[0].toUpperCase() + string.slice(1)
    };
    const basis = `basis-1/${headers.length}`
    const date = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const fullDate = `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

    const listHeaders = [...headers, ''].map((item, index) => <h5 key={index} className={`text-main-white font-semibold text-center py-1 ${basis}`}>{capitalize(item)}</h5>)
    const listContent = content.map((item, index) => 
        <div className='flex w-full'>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>{item.time}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>{item.id}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>{item.cashier}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>{item.total}</h5>
            <Ellipsis className={`text-text ${basis} cursor-pointer`}/>
        </div>
    )

    return (
        <div className='w-full p-4 border-border border-2 rounded-xl'>
            <Title variant='block' text={fullDate} />
            <div className='flex flex-row items-center bg-accent-mute rounded-t-2xl'>
                {listHeaders}
            </div>
            <div className='flex flex-col items-center gap-2 py-2'>
                {listContent}
            </div>
        </div>
    )
})

export default ReceiptsTable;