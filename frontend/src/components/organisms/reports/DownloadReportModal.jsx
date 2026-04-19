import { Button, Label } from '@/components/atoms'
import { ModalBody, ModalFeedbackCard } from '@/components/molecules'
import React, { useState } from 'react'

const DownloadReportModal = ({ onConfirm, onClose }) => {
    const [selectOption, setSelectOption] = useState({
        voided_transactions: false,
        total_transactions: false,
        products_sold: false,
        avg_daily_orders: false,
        total_revenue: false,

        combined_revenue: false,
        total_discount_amount: false,

        total_orders: false,
        pending: false,
        completed: false,
        rejected: false,
        order_total_revenue: false,

        products_sold_trend: false,
        revenue_trend: false,
        top_selling_products: false,
        least_selling_products: false,

        cashier_data: false
    });

    const [feedback, setFeedback] = useState({});

    const optionLabels = {
        voided_transactions: 'Voided Transactions',
        total_transactions: 'Total Transactions',
        products_sold: 'Products Sold',
        avg_daily_orders: 'Average Daily Orders',
        total_revenue: 'POS Total Revenue',
        combined_revenue: 'Combined Revenue',
        total_discount_amount: 'Total Discount Amount',
        total_orders: 'Total Orders',
        pending: 'Pending Orders',
        completed: 'Completed Orders',
        rejected: 'Rejected Orders',
        order_total_revenue: 'Cake Order Revenue',
        products_sold_trend: 'Products Sold Trend',
        revenue_trend: 'Revenue Trend',
        top_selling_products: 'Top Selling Products',
        least_selling_products: 'Least Selling Products',
        cashier_data: 'Cashier Data',
    };

    const groups = {
        sales_data: ['voided_transactions', 'total_transactions', 'products_sold', 'avg_daily_orders', 'total_revenue'],
        revenue_summary: ['combined_revenue', 'total_discount_amount'],
        order_status: ['total_orders', 'pending', 'completed', 'rejected', 'order_total_revenue'],
        products_data: ['products_sold_trend', 'revenue_trend', 'top_selling_products', 'least_selling_products'],
        cashier_data: ['cashier_data'],
    };

    const groupMeta = {
        sales_data: {
            title: 'Sales Data',
            subtitle: 'POS performance and sales totals',
        },
        revenue_summary: {
            title: 'Revenue Summary',
            subtitle: 'Combined revenue and discount metrics',
        },
        order_status: {
            title: 'Order Status',
            subtitle: 'Cake order flow and revenue',
        },
        products_data: {
            title: 'Products Data',
            subtitle: 'Trends and ranking insights',
        },
        cashier_data: {
            title: 'Cashier Data',
            subtitle: 'Cashier revenue performance',
        },
    };

    const selectAll = () => {
        const all = Object.keys(selectOption).reduce((acc, key) => ({
            ...acc,
            [key]: true,
        }), {});

        setSelectOption(all);
    };

    const clearAll = () => {
        const none = Object.keys(selectOption).reduce((acc, key) => ({
            ...acc,
            [key]: false,
        }), {});

        setSelectOption(none);
    };

    const handleGroupToggle = (groupKey) => {
        const keys = groups[groupKey];
        setSelectOption(prev => {
            const newState = { ...prev };
            const allSelected = keys.every(k => newState[k]);
            keys.forEach(k => {
                newState[k] = !allSelected;
            });
            return newState;
        });
    };

    const handleToggle = (key) => {
        setSelectOption(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const returnSelectedData = () => {

        const selectedOptions = Object.keys(selectOption).filter(key => selectOption[key]);

        if (selectedOptions.length === 0) {
            setFeedback({
                type: 'error',
                label: 'No Selected Options',
                details: 'Select at least one option to download'
            })

            return
        }

        onConfirm(selectedOptions)
    };

    return (
        <ModalBody title="Download Report" subtitle="Select report data to export" onClose={onClose} className='w-[min(92vw,980px)] overflow-y-auto'>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2 justify-end'>
                    <Button text='Select All' variant='modalOutline' size='small' onClick={selectAll} />
                    <Button text='Clear' variant='modalOutline' size='small' onClick={clearAll} />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {Object.keys(groups).map((groupKey) => (
                        <div key={groupKey} className='rounded-xl border border-border bg-main-white p-4 shadow-sm'>
                            <div className='flex items-start justify-between gap-3'>
                                <div>
                                    <Label text={groupMeta[groupKey]?.title || groupKey} variant='medium' />
                                    <h5 className='text-xs text-text/60 mt-1'>{groupMeta[groupKey]?.subtitle || ''}</h5>
                                </div>
                                <input
                                    type='checkbox'
                                    checked={groups[groupKey].every(k => selectOption[k])}
                                    onChange={() => handleGroupToggle(groupKey)}
                                    className='w-4 h-4 accent-[#8B5A3C] mt-1'
                                />
                            </div>

                            <div className='mt-3 flex flex-col gap-2'>
                                {groups[groupKey].map((key) => (
                                    <label key={key} className='flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-main cursor-pointer'>
                                        <span className='text-sm text-text'>{optionLabels[key] || key.replace(/_/g, ' ')}</span>
                                        <input
                                            type='checkbox'
                                            checked={selectOption[key]}
                                            onChange={() => handleToggle(key)}
                                            className='w-4 h-4 accent-[#8B5A3C]'
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {Object.keys(feedback).length > 0 &&
                <ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
            }

            <div className='flex flex-row ml-auto gap-2'>
                <Button text='Cancel' variant='modalOutline' size='small' onClick={onClose} />
                <Button text='Download Report' variant='modalBlock' size='small' onClick={returnSelectedData} />
            </div>

        </ModalBody>
    );
};

export default DownloadReportModal;
