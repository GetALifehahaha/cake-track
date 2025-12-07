import React, { useContext, useState } from 'react';
import { Title } from '../components/atoms';
import { TransactionDetails } from '../components/organisms';
import { Ellipsis, X } from 'lucide-react';
import useTransaction from '@/hooks/useTransaction';
import { Pagination } from '@/components/molecules';
import Loading from '@/components/molecules/Loading';
import { DatePicker } from '@/components/molecules';
import { useSearchParams } from 'react-router-dom';
import { formatDateForAPI } from '@/utils/date';
import { AuthContext } from '@/context/AuthContext';

const Transactions = () => {

    // add backend later
    const { transactionData, transactionLoading, transactionError } = useTransaction();
    const { user } = useContext(AuthContext);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentDateParams = searchParams.get('created_at')
    const selectedDate = currentDateParams ? new Date(currentDateParams) : null

    const tableHeader = ['Time', 'Receipt ID', 'Cashier', 'Status', 'Total'];
    const basis = `basis-1/${tableHeader.length}`
    const date = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const fullDate = `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

    const [transactionDetails, setTransactionDetails] = useState(null);
    const [showTransactionDetails, setShowTransactionDetails] = useState(false);

    if (transactionLoading) return <Loading />
    if (transactionError) return <h5>Error loading transactions</h5>


    const handleSetDateFilter = (date) => {
        const newParams = Object.fromEntries(searchParams.entries());

        if (date) {
            newParams.created_at = formatDateForAPI(date)
        } else {
            delete newParams.created_at
        }

        setSearchParams(newParams)
    }

    // 1. Helper to format the Date Key (e.g., "November 30, 2025")
    const getGroupKey = (dateString) => {
        return new Date(dateString).toLocaleDateString('default', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // 2. Group the data
    const groupedTransactions = transactionData.results.reduce((groups, item) => {
        const dateKey = getGroupKey(item.created_at);

        // If this date doesn't exist in our groups yet, create an empty array
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        // Push the item into the correct date bucket
        groups[dateKey].push(item);

        return groups;
    }, {});

    // 3. Sort the dates (Newest First) if needed
    // This assumes your API sends data sorted, but this ensures the keys are in order
    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

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

    const listContent = sortedDates.map((date, dateIndex) => (
        <div key={dateIndex} className="w-full flex flex-col mb-6">

            {/* --- The Date Header --- */}
            {user.is_staff && new Date(date).toDateString() !== new Date().toDateString() &&
                <div className="w-full py-2 px-4 bg-accent-mute/10 rounded-md mb-2 flex items-center justify-between">
                    <h5 className="text-text font-bold text-sm opacity-70 uppercase tracking-wider">
                        {date}
                    </h5>
                </div>
            }

            {/* --- The Items for this Date --- */}
            <div className="flex flex-col gap-2">
                {groupedTransactions[date].map((item, index) => (
                    <div className='flex w-full hover:bg-black/5 p-1 rounded transition-colors' key={item.id}>
                        {/* Time only, since date is in header */}
                        {
                            <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h5>
                        }

                        <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                            {item.id}
                        </h5>

                        <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                            {item.cashier.first_name}
                        </h5>

                        <h5 className={`${item.is_void ? 'text-error' : 'text-success'} font-medium text-center py-0.5 ${basis}`}>
                            {item.is_void ? 'Voided' : 'Success'}
                        </h5>

                        <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                            ₱ {(item?.net_total || 0).toFixed(2)}
                        </h5>

                        {item.is_void ?
                            <div className={basis} /> :
                            <Ellipsis
                                className={`text-text ${basis} cursor-pointer`}
                                onClick={() => handleSetTransactionDetails(item)}
                            />
                        }
                    </div>
                ))}
            </div>
        </div>
    ));

    return (
        <div className='w-[90%] mx-auto flex flex-col gap-8'>
            <Title variant='page' text='Transaction History' />

            <div className='w-full p-4 border-border border-2 rounded-xl'>

                <div className='flex items-center'>
                    <Title variant='block' text={fullDate} />
                    <div className='flex-1' />
                    {selectedDate &&
                        <>
                            <X size={18} className='text-text/50 cursor-pointer mr-2' onClick={() => handleSetDateFilter(false)} />
                        </>
                    }
                    <span className='w-60'>
                        <DatePicker className='bg-white' selected={selectedDate} onSelect={handleSetDateFilter} />
                    </span>
                </div>
                <div className='flex flex-row items-center bg-accent-mute rounded-t-2xl mt-4'>
                    {listHeaders}
                </div>
                <div className='flex flex-col items-center gap-2 py-2 min-h-[40vh]'>
                    {transactionData.results.length == 0 &&
                        <h5 className='font-medium text-text/50 my-auto'>
                            No transactions found
                        </h5>
                    }
                    {listContent}
                </div>
            </div>

            <Pagination prev={transactionData.previous} next={transactionData.next} />

            {showTransactionDetails &&
                <TransactionDetails transactionDetail={transactionDetails} onClose={handleCloseTransactionDetails} />
            }
        </div>
    )
}

export default Transactions;