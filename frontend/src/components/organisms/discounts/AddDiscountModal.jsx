import React, { useState } from 'react';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import { Loader2, InfoIcon, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { DiscountModalPage1, DiscountModalPage2, DiscountModalPage3, DiscountModalPage4 } from './DiscountModalPages';
import { cn } from '@/utils/cn';

const AddDiscountModal = ({ onConfirm, onClose, productOptions = [], categoryOptions = [] }) => {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [discountData, setDiscountData] = useState({
        name: '',
        discount_type: 'percentage',
        value: '0',
        scope: 'all_products',
        products: [],
        categories: [],
        is_indefinite: false,
        start_date: '',
        end_date: '',
        min_order_total: '0.00',
        usage_limit: '',
        active: true,
    })

    const [page, setPage] = useState(1);

    const navigatePage = (page) => {
        setPage(page)
    }

    const handlePage1Submit = (data) => {
        setDiscountData(prev => ({
            ...prev,
            name: data.name,
            discount_type: data.type,
            value: data.value,
        }))
        navigatePage(2)
    }

    const handlePage2Submit = (data) => {
        setDiscountData(prev => ({ ...prev, ...data }))
        navigatePage(3)
    }

    const buildPayload = (sourceData) => {
        const payload = { ...sourceData }

        delete payload.is_indefinite

        if (sourceData.is_indefinite) {
            payload.start_date = null
            payload.end_date = null
        }

        if (payload.usage_limit === '') payload.usage_limit = null
        if (payload.scope !== 'selected_products') payload.products = []
        if (payload.scope !== 'selected_category') payload.categories = []

        return payload
    }

    const handlePage3Submit = (data) => {
        setDiscountData(prev => ({ ...prev, ...data }))
        navigatePage(4)
    }

    const submitDiscount = async () => {
        const payload = buildPayload(discountData)

        setFeedback(null)
        setLoading(true)

        try {
            await onConfirm(payload)
        } catch {
            setFeedback({
                type: 'error',
                label: 'Save Failed',
                details: 'Unable to save discount. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalBody title='Add Discount' onClose={onClose} subtitle='Create a new discount rule' className={'w-[40vw]'}>
            <div className='flex gap-2 item-center text-xs font-semibold w-full border-b border-b-border -mb-4'>
                <span className={cn('cursor-pointer flex items-center gap-2 px-4 pb-2 text-text/50', page === 1 && 'border-b-2 border-b-accent text-accent')}>
                    <InfoIcon size={16} />
                    <h5>Details</h5>
                </span>
                <span className={cn('cursor-pointer flex items-center gap-2 px-4 pb-2 text-text/50', page === 2 && 'border-b-2 border-b-accent text-accent')}>
                    <Activity size={16} />
                    <h5>Rules & Limits</h5>
                </span>
                <span className={cn('cursor-pointer flex items-center gap-2 px-4 pb-2 text-text/50', page === 3 && 'border-b-2 border-b-accent text-accent')}>
                    <Calendar size={16} />
                    <h5>Schedule</h5>
                </span>
                <span className={cn('cursor-pointer flex items-center gap-2 px-4 pb-2 text-text/50', page === 4 && 'border-b-2 border-b-accent text-accent')}>
                    <CheckCircle2 size={16} />
                    <h5>Review</h5>
                </span>
            </div>
            {page === 1 &&
                <DiscountModalPage1
                    data={{
                        name: discountData.name,
                        type: discountData.discount_type,
                        value: discountData.value,
                    }}
                    onSubmit={handlePage1Submit}
                    onClose={onClose}
                />}
            {page === 2 &&
                <DiscountModalPage2
                    data={{
                        scope: discountData.scope,
                        min_order_total: discountData.min_order_total,
                        usage_limit: discountData.usage_limit,
                        active: discountData.active,
                        products: discountData.products,
                        categories: discountData.categories,
                    }}
                    productOptions={productOptions}
                    categoryOptions={categoryOptions}
                    onSubmit={handlePage2Submit}
                    onBack={() => navigatePage(1)}
                />}
            {page === 3 &&
                <DiscountModalPage3
                    data={{
                        is_indefinite: discountData.is_indefinite,
                        start_date: discountData.start_date,
                        end_date: discountData.end_date,
                    }}
                    onSubmit={handlePage3Submit}
                    onBack={() => navigatePage(2)}
                    loading={loading}
                    submitText='Review'
                />}

            {page === 4 && (
                <DiscountModalPage4
                    data={discountData}
                    productOptions={productOptions}
                    categoryOptions={categoryOptions}
                    onBack={() => navigatePage(3)}
                    onConfirm={submitDiscount}
                    loading={loading}
                />
            )}

            {feedback && (
                <div className='mt-4'>
                    <ModalFeedbackCard type={feedback.type} label={feedback.label} details={feedback.details} />
                </div>
            )}

            {loading && (
                <div className='flex items-center gap-2 mt-4'>
                    <Loader2 size={18} className='animate-spin text-accent' />
                    <h5 className='text-accent-mute font-medium text-md'>Saving...</h5>
                </div>
            )}
        </ModalBody>
    );
};

export default AddDiscountModal;