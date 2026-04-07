import React, { useCallback, useState } from 'react';
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

    const navigatePage = (nextPage) => {
        setPage(nextPage)
    }

    const handleDraftChange = useCallback((draft) => {
        setDiscountData((prev) => ({ ...prev, ...draft }))
    }, [])

    const validateForFinalReview = () => {
        const missingFields = []
        const trimmedName = String(discountData.name || '').trim()
        const parsedValue = Number.parseFloat(discountData.value)

        if (!trimmedName) missingFields.push('name')
        if (!discountData.discount_type) missingFields.push('discount_type')

        const hasInvalidValue = !Number.isFinite(parsedValue)
            || parsedValue <= 0
            || (discountData.discount_type === 'percentage' && parsedValue > 100)
        if (hasInvalidValue) missingFields.push('value')

        if (!discountData.scope) missingFields.push('scope')
        if (discountData.scope === 'selected_products' && (!discountData.products || discountData.products.length === 0)) {
            missingFields.push('products')
        }
        if (discountData.scope === 'selected_category' && (!discountData.categories || discountData.categories.length === 0)) {
            missingFields.push('categories')
        }

        if (!discountData.is_indefinite) {
            if (!discountData.start_date) missingFields.push('start_date')
            if (!discountData.end_date) missingFields.push('end_date')

            if (discountData.start_date && discountData.end_date) {
                const start = new Date(discountData.start_date)
                const end = new Date(discountData.end_date)

                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
                    missingFields.push('start_date', 'end_date')
                }
            }
        }

        const uniqueMissingFields = [...new Set(missingFields)]
        if (uniqueMissingFields.length > 0) {
            return {
                ok: false,
                missingFields: uniqueMissingFields,
                label: 'Missing Required Details',
                details: 'Please complete all required fields highlighted in red before saving.',
            }
        }

        return { ok: true, missingFields: [] }
    }

    const stepTabs = [
        { id: 1, icon: InfoIcon, label: 'Details' },
        { id: 2, icon: Activity, label: 'Rules & Limits' },
        { id: 3, icon: Calendar, label: 'Schedule' },
        { id: 4, icon: CheckCircle2, label: 'Review' },
    ]

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
                {stepTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            type='button'
                            onClick={() => navigatePage(tab.id)}
                            className={cn('cursor-pointer flex items-center gap-2 px-4 pb-2 text-text/50', page === tab.id && 'border-b-2 border-b-accent text-accent')}
                        >
                            <Icon size={16} />
                            <h5>{tab.label}</h5>
                        </button>
                    )
                })}
            </div>
            {page === 1 &&
                <DiscountModalPage1
                    data={{
                        name: discountData.name,
                        type: discountData.discount_type,
                        value: discountData.value,
                    }}
                    onSubmit={handlePage1Submit}
                    onDraftChange={handleDraftChange}
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
                    onDraftChange={handleDraftChange}
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
                    onDraftChange={handleDraftChange}
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
                    validateBeforeConfirm={validateForFinalReview}
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