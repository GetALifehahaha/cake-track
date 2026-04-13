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

    const groups = {
        sales_data: ['voided_transactions', 'total_transactions', 'products_sold', 'avg_daily_orders', 'total_revenue'],
        order_status: ['total_orders', 'pending', 'completed', 'rejected', 'order_total_revenue'],
        products_data: ['products_sold_trend', 'revenue_trend', 'top_selling_products', 'least_selling_products'],
        cashier_data: ['cashier_data'],
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
    <ModalBody title="Download Report" subtitle="Select Report Data to Download" onClose={onClose}>
      
      <div className='flex flex-row gap-8'>   
        {/* Sales Data Group */}
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
            <input
                type="checkbox"
                checked={groups.sales_data.every(k => selectOption[k])}
                onChange={() => handleGroupToggle('sales_data')}
            />
            <Label text="Sales Data" variant="medium" />
            </div>
            <div className="flex flex-col gap-2 ml-4">
            {groups.sales_data.map((key) => (
                <div className="flex gap-2" key={key}>
                <input
                    type="checkbox"
                    checked={selectOption[key]}
                    onChange={() => handleToggle(key)}
                />
                <Label text={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} variant="small" />
                </div>
            ))}
            </div>
        </div>

        {/* Order Status Group */}
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
            <input
                type="checkbox"
                checked={groups.order_status.every(k => selectOption[k])}
                onChange={() => handleGroupToggle('order_status')}
            />
            <Label text="Order Status" variant="medium" />
            </div>
            <div className="flex flex-col gap-2 ml-4">
            {groups.order_status.map((key) => (
                <div className="flex gap-2" key={key}>
                <input
                    type="checkbox"
                    checked={selectOption[key]}
                    onChange={() => handleToggle(key)}
                />
                <Label text={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} variant="small" />
                </div>
            ))}
            </div>
        </div>

        {/* Products Data Group */}
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
            <input
                type="checkbox"
                checked={groups.products_data.every(k => selectOption[k])}
                onChange={() => handleGroupToggle('products_data')}
            />
            <Label text="Products Data" variant="medium" />
            </div>
            <div className="flex flex-col gap-2 ml-4">
            {groups.products_data.map((key) => (
                <div className="flex gap-2" key={key}>
                <input
                    type="checkbox"
                    checked={selectOption[key]}
                    onChange={() => handleToggle(key)}
                />
                <Label text={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} variant="small" />
                </div>
            ))}
            </div>
        </div>

        {/* Cashier Data */}
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
            <input
                type="checkbox"
                checked={selectOption.cashier_data}
                onChange={() => handleToggle('cashier_data')}
            />
            <Label text="Cashier Data" variant="medium" />
            </div>
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
