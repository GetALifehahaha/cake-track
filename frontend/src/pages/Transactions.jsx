import React, { useState } from 'react';
import { Title } from '../components/atoms';
import { TransactionDetails } from '../components/organisms';
import { Ellipsis } from 'lucide-react';

const Transactions = () => {
    
    // add backend later
    const tableHeader = ['Time', 'Receipt ID', 'Cashier', 'Status', 'Total'];
    const tableContent = [
        {time: '11: 00 AM', id: '1556', cashier: 'Adrian', status: 'Success', total: '55', orderItems: [{name: "Cookies n Cream Frappe", amount: 1, }]},
        {time: '11: 00 AM', id: '1557', cashier: 'Adrian', status: 'Voided', total: '105', orderItems: [{name: "Cookies n Cream Frappe", amount: 1, }, {name: "Matcha in the Morning", amount: 1, },]},
    ];
    const basis = `basis-1/${tableHeader.length}`
    const date = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const fullDate = `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

    const [transactions, setTransactions] = useState(tableContent);
    const [transactionDetails, setTransactionDetails] = useState(null);

    const [showTransactionDetails, setShowTransactionDetails] = useState(false);

    const capitalize = (string) => {
        if (string) return string[0].toUpperCase() + string.slice(1)
    };

    const handleSetTransactionDetails = (transaction) => {
        setTransactionDetails(transaction);
        handleSetShowTransactionDetails();
    }

    const handleSetShowTransactionDetails = () => {
        setShowTransactionDetails(!showTransactionDetails);
    }

    const handleCloseTransactionDetails = () => {
        handleSetTransactionDetails(null);
        handleSetShowTransactionDetails();
    }

    const listHeaders = [...tableHeader, ''].map((item, index) => <h5 key={index} className={`text-main-white font-semibold text-center py-1 ${basis}`}>{capitalize(item)}</h5>)

    const listContent = transactions.map((item, index) => 
        <div className='flex w-full'>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>{item.time}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>{item.id}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>{item.cashier}</h5>
            <h5 className={`${item.status == "Success" ? 'text-success' : 'text-error'} font-medium text-center py-0.5 ${basis}`}>{item.status}</h5>
            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>P {item.total}</h5>
            <Ellipsis className={`text-text ${basis} cursor-pointer`} onClick={() => handleSetTransactionDetails(item)}/>
        </div>
    )

    return (
        <div className='w-[80%] mx-auto flex flex-col gap-8'>
            <Title variant='page' text='Receipt History'/>

            <div className='w-full p-4 border-border border-2 rounded-xl'>
                <Title variant='block' text={fullDate} />
                <div className='flex flex-row items-center bg-accent-mute rounded-t-2xl'>
                    {listHeaders}
                </div>
                <div className='flex flex-col items-center gap-2 py-2'>
                    {listContent}
                </div>
            </div>

            {showTransactionDetails &&
                <TransactionDetails transactionDetail={transactionDetails} onClose={handleCloseTransactionDetails}/>
            }
        </div>
    )
}

export default Transactions;