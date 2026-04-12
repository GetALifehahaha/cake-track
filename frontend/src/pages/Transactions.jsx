import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Title } from '../components/atoms';
import { TransactionDetails } from '../components/organisms';
import { Ellipsis, X } from 'lucide-react';
import useTransaction from '@/hooks/useTransaction';
import { ModalBody, Pagination } from '@/components/molecules';
import { DatePicker } from '@/components/molecules';
import { useSearchParams } from 'react-router-dom';
import { formatDateForAPI } from '@/utils/date';
import { AuthContext } from '@/context/AuthContext';
import { formatToDecimal } from '@/utils/formatToDecimal';
import { TransactionsSkeleton } from '@/components/molecules/Skeletons';
import { useToast } from '@/context/ToastContext';
import { inputNumber, inputText } from '@/utils/safeInput';

const transactionStatusOptions = [
    { key: 'Success', value: 'success' },
    { key: 'Voided', value: 'voided' },
];

const toCashierOption = (cashier) => {
    if (!cashier?.id) return null;

    const id = String(cashier.id);
    const fullName = [cashier.first_name, cashier.last_name].filter(Boolean).join(' ').trim();
    const label = fullName || cashier.username || cashier.email || `Cashier ${cashier.id}`;

    return { id, option: { key: label, value: id } };
};

const Transactions = () => {
    const {
        data,
        loading,
        error,
        registerMoney,
        refreshRegisterMoney,
        setStartingMoney,
        postDeduction,
        registerTransactions,
        refreshRegisterTransactions,
    } = useTransaction();

    const { user } = useContext(AuthContext);
    const { addToast } = useToast();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentDateParams = searchParams.get('created_at');
    const selectedDate = currentDateParams ? new Date(currentDateParams) : null;
    const selectedCashier = searchParams.get('cashier') || null;
    const selectedStatus =
        searchParams.get('is_void') === 'true'
            ? 'voided'
            : searchParams.get('is_void') === 'false'
                ? 'success'
                : null;

    const [cashierOptionsCache, setCashierOptionsCache] = useState({});

    useEffect(() => {
        const incoming = data?.results || [];
        if (!incoming.length) return;

        setCashierOptionsCache((previous) => {
            const next = { ...previous };

            incoming.forEach((item) => {
                const parsed = toCashierOption(item?.cashier);
                if (!parsed) return;

                next[parsed.id] = parsed.option;
            });

            return next;
        });
    }, [data?.results]);

    const cashierOptions = useMemo(() => {
        return Object.values(cashierOptionsCache).sort((a, b) => String(a.key).localeCompare(String(b.key)));
    }, [cashierOptionsCache]);

    useEffect(() => {
        if (searchParams.get('is_completed') === 'true') return;

        const newParams = Object.fromEntries(searchParams.entries());
        newParams.is_completed = 'true';
        setSearchParams(newParams, { replace: true });
    }, [searchParams, setSearchParams]);

    const tableHeader = ['Time', 'Receipt ID', 'Cashier', 'Status', 'Total'];
    const basis = `basis-1/${tableHeader.length}`;

    const date = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const fullDate = `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    const [transactionDetails, setTransactionDetails] = useState(null);
    const [showTransactionDetails, setShowTransactionDetails] = useState(false);

    const [showRegisterMoneyModal, setShowRegisterMoneyModal] = useState(false);
    const [showRegisterTransactionsModal, setShowRegisterTransactionsModal] = useState(false);

    const [startingMoneyInput, setStartingMoneyInput] = useState('');
    const [deductionAmount, setDeductionAmount] = useState('');
    const [deductionNote, setDeductionNote] = useState('');

    if (loading) return <TransactionsSkeleton />;
    if (error) return <h5>Error loading transactions</h5>;

    const updateTransactionParams = (updates) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
                return;
            }

            params.set(key, value);
        });

        params.set('is_completed', 'true');
        params.set('transaction_page', '1');
        setSearchParams(params);
    };

    const handleSetDateFilter = (dateValue) => {
        updateTransactionParams({
            created_at: dateValue ? formatDateForAPI(dateValue) : null,
        });
    };

    const handleSetCashierFilter = (value) => {
        updateTransactionParams({ cashier: value });
    };

    const handleSetStatusFilter = (value) => {
        if (!value) {
            updateTransactionParams({ is_void: null });
            return;
        }

        updateTransactionParams({ is_void: value === 'voided' ? 'true' : 'false' });
    };

    const clearFilters = () => {
        updateTransactionParams({
            cashier: null,
            is_void: null,
            created_at: null,
        });
    };

    const getGroupKey = (dateString) => {
        return new Date(dateString).toLocaleDateString('default', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const completedTransactions = (data?.results || []).filter((item) => item.is_completed);

    const groupedTransactions = completedTransactions.reduce((groups, item) => {
        const dateKey = getGroupKey(item.created_at);

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].push(item);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

    const capitalize = (string) => {
        if (string) return string[0].toUpperCase() + string.slice(1);
    };

    const handleSetTransactionDetails = (transaction) => {
        setTransactionDetails(transaction);
        setShowTransactionDetails(true);
    };

    const handleCloseTransactionDetails = () => {
        setTransactionDetails(null);
        setShowTransactionDetails(false);
    };

    const handleSubmitStartingMoney = async () => {
        const amount = Number.parseFloat(startingMoneyInput);

        if (!Number.isFinite(amount) || amount < 0) {
            addToast('Enter a valid starting money amount.', 'error');
            return;
        }

        try {
            await setStartingMoney(amount);
            await Promise.all([refreshRegisterMoney(), refreshRegisterTransactions()]);
            setStartingMoneyInput('');
            addToast('Starting money updated.', 'success');
        } catch (err) {
            const detail = err?.response?.data?.detail || 'Failed to update starting money.';
            addToast(detail, 'error');
        }
    };

    const handleSubmitDeduction = async () => {
        const amount = Number.parseFloat(deductionAmount);
        const trimmedReason = deductionNote.trim();

        if (!Number.isFinite(amount) || amount <= 0) {
            addToast('Enter a valid deduction amount.', 'error');
            return;
        }

        if (!trimmedReason) {
            addToast('Reason is required for register deduction.', 'error');
            return;
        }

        try {
            await postDeduction({ amount, note: trimmedReason });
            await Promise.all([refreshRegisterMoney(), refreshRegisterTransactions()]);
            setDeductionAmount('');
            setDeductionNote('');
            addToast('Deduction recorded.', 'success');
        } catch (err) {
            const detail = err?.response?.data?.detail || 'Failed to record deduction.';
            addToast(detail, 'error');
        }
    };

    const listHeaders = [...tableHeader, ''].map((item, index) => (
        <h5 key={index} className={`text-main-white font-semibold text-center py-1 ${basis}`}>
            {capitalize(item)}
        </h5>
    ));

    const registerTransactionItems = Array.isArray(registerTransactions?.results)
        ? registerTransactions.results
        : [];

    const listContent = sortedDates.map((dateLabel, dateIndex) => (
        <div key={dateIndex} className='w-full flex flex-col mb-6'>
            {user.is_staff && new Date(dateLabel).toDateString() !== new Date().toDateString() && (
                <div className='w-full py-2 px-4 bg-accent-mute/10 rounded-md mb-2 flex items-center justify-between'>
                    <h5 className='text-text font-bold text-sm opacity-70 uppercase tracking-wider'>{dateLabel}</h5>
                </div>
            )}

            <div className='flex flex-col gap-2'>
                {groupedTransactions[dateLabel].map((item) => (
                    <div className='flex w-full hover:bg-black/5 p-1 rounded transition-colors' key={item.id}>
                        <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h5>

                        <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                            {item?.display_id || item.id}
                        </h5>

                        <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                            {item.cashier.first_name}
                        </h5>

                        <h5 className={`${item.is_void ? 'text-error' : 'text-success'} font-medium text-center py-0.5 ${basis}`}>
                            {item.is_void ? 'Voided' : 'Success'}
                        </h5>

                        <h5 className={`text-text font-medium text-center py-0.5 ${basis}`}>
                            ₱ {formatToDecimal(item.net_total)}
                        </h5>

                        <Ellipsis
                            className={`text-text ${basis} cursor-pointer`}
                            onClick={() => handleSetTransactionDetails(item)}
                        />
                    </div>
                ))}
            </div>
        </div>
    ));

    return (
        <div className='w-full mx-auto flex flex-col gap-8'>
            <Title variant='page' text='Transaction History' />

            <div className='px-4 py-2.5 rounded-xl border-2 border-border'>
                <div className='flex items-center gap-4 flex-wrap'>
                    <div className='p-2.5 px-8 rounded-lg bg-accent-mute/20 border border-border flex items-center gap-12'>
                        <h5 className='text-accent-text font-medium text-md'>
                            Today's Revenue: <strong className='ml-2 text-accent-dark p-2'>₱ {(data.daily_total_revenue).toFixed(2)}</strong>
                        </h5>
                        <h5 className='text-accent-text font-medium text-md'>
                            Register Money: <strong className='ml-2 text-accent-dark'>₱ {formatToDecimal(registerMoney?.current_amount || 0)}</strong>
                        </h5>
                    </div>

                    <div className='ml-auto flex items-center gap-2'>
                        <Button variant='modalBlock' size='small' text='Set Register Money' onClick={() => setShowRegisterMoneyModal(true)} />
                        {user?.is_staff && (
                            <Button
                                variant='modalBlock'
                                size='small'
                                text='Register Transactions'
                                onClick={() => setShowRegisterTransactionsModal(true)}
                                className='bg-white text-text shadow-sm'
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className='w-full p-4 border-border border-2 rounded-xl'>
                <div className='flex items-center'>
                    <Title variant='block' text={fullDate} />
                    <div className='flex-1' />

                    <div className='flex flex-wrap items-end gap-2'>
                        <div className='w-48'>
                            <h5 className='text-xs font-semibold text-text/50 mb-1'>Cashier</h5>
                            <Dropdown
                                size='full'
                                variant='white'
                                selection='All cashiers'
                                value={selectedCashier}
                                options={cashierOptions}
                                onSelect={handleSetCashierFilter}
                            />
                        </div>

                        <div className='w-36'>
                            <h5 className='text-xs font-semibold text-text/50 mb-1'>Status</h5>
                            <Dropdown
                                size='full'
                                variant='white'
                                selection='Any status'
                                value={selectedStatus}
                                options={transactionStatusOptions}
                                onSelect={handleSetStatusFilter}
                            />
                        </div>

                        <div className='w-60'>
                            <h5 className='text-xs font-semibold text-text/50 mb-1'>Date</h5>
                            <div className='flex items-center gap-2'>
                                <DatePicker className='bg-white' selected={selectedDate} onSelect={handleSetDateFilter} />
                                {selectedDate && (
                                    <X size={18} className='text-text/50 cursor-pointer' onClick={() => handleSetDateFilter(null)} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-row items-center bg-accent-mute rounded-t-2xl mt-4'>
                    {listHeaders}
                </div>

                <div className='flex flex-col items-center gap-2 py-2 min-h-[40vh]'>
                    {completedTransactions.length === 0 && (
                        <h5 className='font-medium text-text/50 my-auto'>No transactions found</h5>
                    )}
                    {listContent}
                </div>
            </div>

            <Pagination prev={data.previous} next={data.next} count={data?.count} pageParam='transaction_page' />

            {showTransactionDetails && (
                <TransactionDetails transactionDetail={transactionDetails} onClose={handleCloseTransactionDetails} />
            )}

            {showRegisterMoneyModal && (
                <ModalBody
                    title='Set Register Money'
                    subtitle='Manage register balance for your shift.'
                    onClose={() => setShowRegisterMoneyModal(false)}
                    className='w-[520px]'
                >
                    <div className='flex flex-col gap-4'>
                        <div className='rounded-lg border border-border p-3'>
                            <h5 className='text-sm font-medium text-text'>Register Money</h5>
                            <h5 className='text-lg font-bold text-accent-dark'>₱ {formatToDecimal(registerMoney?.current_amount || 0)}</h5>
                        </div>

                        <div className='rounded-lg border border-border p-3'>
                            <h5 className='text-sm font-medium text-text'>Starting Money</h5>
                            <h5 className='text-lg font-bold text-accent-dark'>₱ {formatToDecimal(registerMoney?.starting_money || 0)}</h5>
                        </div>

                        <div className='flex flex-col gap-2 border-t border-border pt-3'>
                            <h5 className='text-sm font-semibold text-text'>Set Starting Money</h5>
                            <div className='flex items-center gap-2'>
                                <input
                                    type='text'
                                    value={startingMoneyInput}
                                    onChange={(e) => {
                                        const value = inputNumber(e);
                                        if (value !== undefined) setStartingMoneyInput(value);
                                    }}
                                    placeholder='0.00'
                                    className='focus:outline-none p-2 rounded-lg border border-border bg-main-white flex-1'
                                />
                                <Button variant='modalBlock' size='small' text='Save' onClick={handleSubmitStartingMoney} />
                            </div>
                        </div>

                        <div className='flex flex-col gap-2 border-t border-border pt-3'>
                            <h5 className='text-sm font-semibold text-text'>Register Deduction</h5>
                            <div className='flex items-center gap-2'>
                                <input
                                    type='text'
                                    value={deductionAmount}
                                    onChange={(e) => {
                                        const value = inputNumber(e, 11, registerMoney?.current_amount);
                                        if (value !== undefined) setDeductionAmount(value);
                                    }}
                                    placeholder='Amount'
                                    className='focus:outline-none p-2 rounded-lg border border-border bg-main-white flex-1'
                                />
                                <Button variant='modalBlock' size='small' text='Deduct' onClick={handleSubmitDeduction} />
                            </div>
                            <input
                                type='text'
                                value={deductionNote}
                                onChange={(e) => {
                                    const value = inputText(e, 255);
                                    if (value !== undefined) setDeductionNote(value);
                                }}
                                placeholder='Reason (required)'
                                className='focus:outline-none p-2 rounded-lg border border-border bg-main-white'
                            />
                        </div>

                        <div className='flex justify-end'>
                            <Button variant='modalOutline' size='modalSize' text='Close' onClick={() => setShowRegisterMoneyModal(false)} />
                        </div>
                    </div>
                </ModalBody>
            )}

            {showRegisterTransactionsModal && user?.is_staff && (
                <ModalBody
                    title='Register Transactions'
                    subtitle='History of additions and deductions.'
                    onClose={() => setShowRegisterTransactionsModal(false)}
                    className='w-[75vw]'
                >
                    <div className='flex flex-col gap-3 max-h-[70vh]'>
                        <div className='grid grid-cols-4 gap-2 bg-accent-mute rounded-lg px-3 py-2'>
                            <h5 className='text-main-white font-semibold text-sm'>Deductions/Additions</h5>
                            <h5 className='text-main-white font-semibold text-sm'>Cashier</h5>
                            <h5 className='text-main-white font-semibold text-sm'>Amount</h5>
                            <h5 className='text-main-white font-semibold text-sm'>Timestamp</h5>
                        </div>

                        <div className='flex flex-col gap-2 overflow-y-auto'>
                            {registerTransactionItems.length === 0 && (
                                <h5 className='font-medium text-text/50 py-8 text-center'>No register transactions found.</h5>
                            )}

                            {registerTransactionItems.map((entry) => (
                                <div key={entry.id} className='grid grid-cols-4 gap-2 border border-border rounded-lg px-3 py-2'>
                                    <div className='flex flex-col'>
                                        <h5 className={`text-sm font-medium ${entry.entry_type === 'addition' ? 'text-success' : 'text-error'}`}>
                                            {entry.entry_type === 'addition' ? 'Addition' : 'Deduction'}
                                        </h5>
                                        {entry.entry_type === 'deduction' && entry.note && (
                                            <h5 className='text-xs text-text/60 mt-0.5'>Reason: {entry.note}</h5>
                                        )}
                                    </div>
                                    <h5 className='text-sm text-text'>
                                        {entry?.cashier?.first_name} {entry?.cashier?.last_name}
                                    </h5>
                                    <h5 className='text-sm text-text'>₱ {formatToDecimal(entry.amount || 0)}</h5>
                                    <h5 className='text-sm text-text/70'>{new Date(entry.created_at).toLocaleString()}</h5>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            prev={registerTransactions?.previous}
                            next={registerTransactions?.next}
                            count={registerTransactions?.count}
                            pageParam='register_page'
                        />
                    </div>
                </ModalBody>
            )}
        </div>
    );
};

export default Transactions;
