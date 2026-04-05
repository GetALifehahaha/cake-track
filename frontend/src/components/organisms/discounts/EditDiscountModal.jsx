import React, { useState } from 'react';
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import { Loader2, InfoIcon, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { DiscountModalPage1, DiscountModalPage2, DiscountModalPage3, DiscountModalPage4 } from './DiscountModalPages';
import { cn } from '@/utils/cn';
import ConfirmationModal from '../ConfirmationModal';

const EditDiscountModal = ({ discount, productOptions = [], categoryOptions = [], onConfirm, onDelete, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formatLocalISO = (date) => {
        const offset = date.getTimezoneOffset();
        return new Date(date.getTime() - (offset * 60 * 1000)).toISOString().slice(0, 16);
    };

    const initialStartDate = discount.start_date ? formatLocalISO(new Date(discount.start_date)) : formatLocalISO(now);
    const initialEndDate = discount.end_date ? formatLocalISO(new Date(discount.end_date)) : formatLocalISO(future);
    const initialIndefinite = !discount.start_date && !discount.end_date;

    const [discountData, setDiscountData] = useState({
        name: discount.name || '',
        discount_type: discount.discount_type || 'percentage',
        value: String(discount.value ?? '0'),
        scope: discount.scope || 'all_products',
        products: discount.products || [],
        categories: discount.categories || [],
        is_indefinite: initialIndefinite,
        start_date: initialIndefinite ? '' : initialStartDate,
        end_date: initialIndefinite ? '' : initialEndDate,
        min_order_total: String(discount.min_order_total ?? '0.00'),
        usage_limit: discount.usage_limit === null || discount.usage_limit === undefined ? '' : String(discount.usage_limit),
        active: Boolean(discount.active),
    });

    const originalDiscountData = {
        name: discount.name || '',
        discount_type: discount.discount_type || 'percentage',
        value: String(discount.value ?? '0'),
        scope: discount.scope || 'all_products',
        products: discount.products || [],
        categories: discount.categories || [],
        is_indefinite: initialIndefinite,
        start_date: initialIndefinite ? '' : initialStartDate,
        end_date: initialIndefinite ? '' : initialEndDate,
        min_order_total: String(discount.min_order_total ?? '0.00'),
        usage_limit: discount.usage_limit === null || discount.usage_limit === undefined ? '' : String(discount.usage_limit),
        active: Boolean(discount.active),
    }

    const [page, setPage] = useState(1);

    const navigatePage = (nextPage) => {
        setPage(nextPage);
    };

    const handlePage1Submit = (data) => {
        setDiscountData((prev) => ({
            ...prev,
            name: data.name,
            discount_type: data.type,
            value: data.value,
        }));
        navigatePage(2);
    };

    const handlePage2Submit = (data) => {
        setDiscountData((prev) => ({ ...prev, ...data }));
        navigatePage(3);
    };

    const handlePage3Submit = (data) => {
        setDiscountData((prev) => ({ ...prev, ...data }));
        navigatePage(4);
    };

    const buildPayload = (sourceData) => {
        const payload = { ...sourceData };

        delete payload.is_indefinite;

        if (sourceData.is_indefinite) {
            payload.start_date = null;
            payload.end_date = null;
        }

        if (payload.usage_limit === '') payload.usage_limit = null;
        if (payload.scope !== 'selected_products') payload.products = [];
        if (payload.scope !== 'selected_category') payload.categories = [];

        return payload;
    };

    const submitDiscount = async () => {
        const payload = buildPayload(discountData);

        setFeedback(null);
        setLoading(true);

        try {
            await onConfirm(payload);
        } catch {
            setFeedback({
                type: 'error',
                label: 'Update Failed',
                details: 'Unable to update discount. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        setShowDeleteConfirmation(false);
        await onDelete(discount.id);
    };

    return (
        <ModalBody title='Edit Discount' onClose={onClose} subtitle={`Editing rules for ${discount.name}`} className={'w-[40vw]'}>
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

            {page === 1 && (
                <DiscountModalPage1
                    data={{
                        name: discountData.name,
                        type: discountData.discount_type,
                        value: discountData.value,
                    }}
                    onSubmit={handlePage1Submit}
                    onClose={onClose}
                    onDanger={() => setShowDeleteConfirmation(true)}
                    dangerText='Delete Discount'
                />
            )}

            {page === 2 && (
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
                />
            )}

            {page === 3 && (
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
                />
            )}

            {page === 4 && (
                <DiscountModalPage4
                    data={discountData}
                    originalData={originalDiscountData}
                    productOptions={productOptions}
                    categoryOptions={categoryOptions}
                    onBack={() => navigatePage(3)}
                    onConfirm={submitDiscount}
                    loading={loading}
                    summarySubtitle='Review before updating discount'
                    actionText='Update Discount'
                    confirmTitle='Update Discount'
                    confirmContent='Are you sure you want to update this discount with the above details?'
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

            {showDeleteConfirmation && (
                <ConfirmationModal
                    title='Delete Discount'
                    content={`Are you sure you want to delete the discount "${discount.name}"? This action cannot be undone.`}
                    confirmText='Delete'
                    cancelText='Cancel'
                    onConfirm={confirmDelete}
                    onReject={() => setShowDeleteConfirmation(false)}
                />
            )}
        </ModalBody>
    );
};

export default EditDiscountModal;
