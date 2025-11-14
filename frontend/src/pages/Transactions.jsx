import React from 'react';
import { Title } from '../components/atoms';
import { ReceiptsTable } from '../components/organisms';

const Transactions = () => {
    
    // add backend later
    const tableHeader = ['Time', 'Receipt ID', 'Cashier', 'Total'];

    const tableContent = [
        {time: '11: 00 AM', id: '1556', cashier: 'Mary F.', total: 'P200',},
    ];

    return (
        <div className='w-[80%] mx-auto flex flex-col gap-8'>
            <Title variant='page' text='Receipt History'/>
            <div>
                <ReceiptsTable headers={tableHeader} content={tableContent} />
            </div>
        </div>
    )
}

export default Transactions;