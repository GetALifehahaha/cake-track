import React, { useState } from 'react';
import { Button, Dropdown, Label } from '../../atoms';
import { DatePicker, ModalBody, ModalFeedbackCard } from '../../molecules';
import ConfirmationModal from '../ConfirmationModal';
import { Loader2 } from 'lucide-react';
import ScopeSelectionModal from './ScopeSelectionModal';
import { limitedInput } from '@/utils/safeInput';

const EditDiscountModal = ({ discount, productOptions, categoryOptions, onConfirm, onDelete, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showScopeSelector, setShowScopeSelector] = useState(false);

    const [confirmation, setConfirmation] = useState(null);

    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const formatLocalISO = (date) => {
        const offset = date.getTimezoneOffset();
        return new Date(date.getTime() - (offset * 60 * 1000)).toISOString().slice(0, 16);
    };
    const initialStartDate = discount.start_date ? new Date(discount.start_date).toISOString().slice(0, 16) : formatLocalISO(now);
    const initialEndDate = discount.end_date ? new Date(discount.end_date).toISOString().slice(0, 16) : formatLocalISO(future);
    const initialIndefinite = !discount.start_date && !discount.end_date;

    const [formData, setFormData] = useState({
        name: discount.name,
        discount_type: discount.discount_type,
        value: String(Math.trunc(Number(discount.value || 0))),
        scope: discount.scope,
        products: discount.products || [],
        categories: discount.categories || [],
        start_date: initialStartDate,
        end_date: initialEndDate,
        is_indefinite: initialIndefinite,
        min_order_total: String(Math.trunc(Number(discount.min_order_total || 0))),
        usage_limit: discount.usage_limit === null || discount.usage_limit === undefined
            ? ""
            : String(Math.trunc(Number(discount.usage_limit))),
        active: discount.active
    });

    const typeOptions = [
        { key: "Percentage", value: "percentage" },
        { key: "Fixed Amount", value: "fixed" }
    ];

    const scopeOptions = [
        { key: "Entire Order", value: "all_products" },
        { key: "Selected Products", value: "selected_products" },
        { key: "Selected Category", value: "selected_category" }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSelection = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const handleIntegerFieldChange = (field, e, maxLength = 11) => {
        const value = limitedInput(e, { maxLength, isNumber: true });
        if (value === undefined) return;
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleScopeSelectionConfirm = (selected) => {
        if (formData.scope === 'selected_products') {
            setFormData(prev => ({ ...prev, products: selected }));
        } else if (formData.scope === 'selected_category') {
            setFormData(prev => ({ ...prev, categories: selected }));
        }
        setShowScopeSelector(false);
    };

    const handleDateUpdate = (field, selectedDate) => {
        if (formData.is_indefinite) return;
        if (!selectedDate) return;
        setFormData(prev => {
            const timePart = prev[field].split('T')[1];
            const offset = selectedDate.getTimezoneOffset();
            const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
            return { ...prev, [field]: `${localDate}T${timePart}` };
        });
    };

    const handleTimeUpdate = (field, e) => {
        if (formData.is_indefinite) return;
        const timePart = e.target.value;
        setFormData(prev => {
            const datePart = prev[field].split('T')[0];
            return { ...prev, [field]: `${datePart}T${timePart}` };
        });
    };

    const handleIndefiniteSchedule = (checked) => {
        setFormData(prev => ({
            ...prev,
            is_indefinite: checked,
            start_date: checked ? '' : (prev.start_date || formatLocalISO(now)),
            end_date: checked ? '' : (prev.end_date || formatLocalISO(future)),
        }));
    };

    const handleDelete = (id) => {
        setConfirmation({
            title: "Delete Discount",
            content: `Are you sure you want to delete the discount "${discount.name}"? This action cannot be undone.`,
            confirm: () => {
                setConfirmation(null);
                onDelete(id);
            }
        });
    }

    const validate = () => {
        const parsedValue = Number.parseInt(formData.value, 10);

        if (!formData.name.trim() || !Number.isFinite(parsedValue) || parsedValue <= 0) {
            setFeedback({ label: 'Invalid Fields', details: 'Please enter a valid name and discount value.', type: 'error' });
            return false;
        }

        if (formData.discount_type === 'percentage' && parsedValue > 100) {
            setFeedback({ label: 'Invalid Value', details: 'Percentage discount cannot exceed 100.', type: 'error' });
            return false;
        }

        if (!formData.is_indefinite) {
            if (!formData.start_date || !formData.end_date) {
                setFeedback({ label: 'Invalid Schedule', details: 'Please provide both start and end date.', type: 'error' });
                return false;
            }

            if (new Date(formData.start_date) > new Date(formData.end_date)) {
                setFeedback({ label: 'Invalid Schedule', details: 'End date cannot be earlier than start date.', type: 'error' });
                return false;
            }
        }

        return true;
    };

    const submit = () => {
        if (!validate()) return;
        setLoading(true);
        const payload = { ...formData };
        delete payload.is_indefinite;
        if (formData.is_indefinite) {
            payload.start_date = null;
            payload.end_date = null;
        }
        if (payload.usage_limit === "") payload.usage_limit = null;
        if (payload.scope !== 'selected_products') payload.products = [];
        if (payload.scope !== 'selected_category') payload.categories = [];

        onConfirm(payload);
    };

    const scopeIsSelectable = formData.scope === 'selected_products' || formData.scope === 'selected_category';
    const selectedScopeOptions = formData.scope === 'selected_products' ? formData.products : formData.categories;
    const currentScopeOptions = formData.scope === 'selected_products' ? productOptions : categoryOptions;
    const selectedSummary = currentScopeOptions.filter((option) => selectedScopeOptions.some((id) => String(id) === String(option.value)));
    const summaryTopFive = selectedSummary.slice(0, 5);
    const summaryOverflowCount = selectedSummary.length > 5 ? selectedSummary.length - 5 : 0;


    return (
        <ModalBody title='Edit Discount' onClose={onClose} subtitle={`Editing rules for ${discount.name}`} className={'w-[80vw]'}>
            <div className='flex flex-row gap-6 max-h-[70vh] overflow-y-auto pr-2 pb-2'>
                {/* TOP ROW: Details (Left) & Schedule (Right) */}
                <div className='grid grid-row-2 gap-6 flex-1'>
                    {/* Details Section */}
                    <div className='flex flex-col gap-4'>
                        <h6 className='text-xs text-text/50 font-bold uppercase tracking-wider'>Details</h6>

                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Discount Name' />
                            <input name='name' type='text' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border' value={formData.name} onChange={handleInputChange} placeholder='e.g., Summer Sale' />
                        </div>

                        <div className='flex gap-4'>
                            <div className='flex flex-col gap-2 flex-1'>
                                <Label variant='modal' text='Discount Type' />
                                <Dropdown allowNone={false} variant='modal' value={formData.discount_type} options={typeOptions} onSelect={(val) => handleSelection('discount_type', val)} />
                            </div>
                            <div className='flex flex-col gap-2 flex-1'>
                                <Label variant='modal' text='Value' />
                                <input name='value' type='text' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border' value={formData.value} onChange={(e) => handleIntegerFieldChange('value', e)} placeholder='0' />
                            </div>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className='flex flex-col gap-4'>
                        <h6 className='text-xs text-text/50 font-bold uppercase tracking-wider'>Schedule</h6>

                        <div className='flex items-center gap-3'>
                            <input
                                type='checkbox'
                                id='edit-discount-indefinite'
                                checked={formData.is_indefinite}
                                onChange={(e) => handleIndefiniteSchedule(e.target.checked)}
                                className='w-4 h-4 accent-accent cursor-pointer'
                            />
                            <label htmlFor='edit-discount-indefinite' className='text-sm text-text font-medium cursor-pointer'>
                                Permanent
                            </label>
                        </div>

                        {!formData.is_indefinite && (
                            <>
                                <div className='flex flex-col gap-2'>
                                    <Label variant='modal' text='Start Date & Time' />
                                    <div className='flex gap-2 items-center'>
                                        <div className='flex-1'>
                                            <DatePicker selected={formData.start_date ? new Date(formData.start_date) : null} onSelect={(d) => handleDateUpdate('start_date', d)} />
                                        </div>
                                        <input type='time' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none border border-border w-1/3' value={formData.start_date ? formData.start_date.split('T')[1] : '00:00'} onChange={(e) => handleTimeUpdate('start_date', e)} />
                                    </div>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <Label variant='modal' text='End Date & Time' />
                                    <div className='flex gap-2 items-center'>
                                        <div className='flex-1'>
                                            <DatePicker selected={formData.end_date ? new Date(formData.end_date) : null} onSelect={(d) => handleDateUpdate('end_date', d)} />
                                        </div>
                                        <input type='time' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none border border-border w-1/3' value={formData.end_date ? formData.end_date.split('T')[1] : '23:59'} onChange={(e) => handleTimeUpdate('end_date', e)} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* BOTTOM SECTION: Rules & Active Status */}
                <div className='flex flex-col gap-6 flex-1'>
                    {/* Rules & Limits Section */}
                    <div className='flex flex-col gap-4'>
                        <h6 className='text-xs text-text/50 font-bold uppercase tracking-wider'>Rules & Limits</h6>

                        <div className='flex flex-col gap-2 w-full pr-3'>
                            <Label variant='modal' text='Scope' />
                            <div className='flex items-center justify-between gap-2'>
                                <div className='flex-1'>
                                    <Dropdown allowNone={false} variant='modal' value={formData.scope} options={scopeOptions} onSelect={(val) => handleSelection('scope', val)} />
                                </div>
                                {scopeIsSelectable && (
                                    <Button
                                        variant='modalOutline'
                                        size='small'
                                        text={formData.scope === 'selected_products' ? 'Select Products' : 'Select Categories'}
                                        onClick={() => setShowScopeSelector(true)}
                                        className='whitespace-nowrap'
                                    />
                                )}
                            </div>
                            {scopeIsSelectable && selectedSummary.length > 0 && (
                                <div className='mt-2 rounded-md border border-border bg-main-white p-3'>
                                    <h5 className='text-xs font-semibold text-text/60 uppercase tracking-wider mb-2'>Selected</h5>
                                    <div className='flex flex-col gap-1'>
                                        {summaryTopFive.map((item) => (
                                            <h5 key={item.value} className='text-sm text-text'>{item.key}</h5>
                                        ))}
                                        {summaryOverflowCount > 0 && (
                                            <h5 className='text-sm text-text/70 italic'>And {summaryOverflowCount} more {formData.scope === 'selected_products' ? 'products' : 'categories'}...</h5>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='flex gap-4 mt-2'>
                            <div className='flex flex-col gap-2 flex-1'>
                                <Label variant='modal' text='Min Order Total (₱)' />
                                <input name='min_order_total' type='text' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border' value={formData.min_order_total} onChange={(e) => handleIntegerFieldChange('min_order_total', e)} />
                            </div>
                            <div className='flex flex-col gap-2 flex-1'>
                                <Label variant='modal' text='Usage Limit' />
                                <input name='usage_limit' type='text' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border' value={formData.usage_limit} onChange={(e) => handleIntegerFieldChange('usage_limit', e)} placeholder='No limit' />
                            </div>
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className='flex items-center gap-3'>
                        <input type='checkbox' name='active' id='active-toggle' checked={formData.active} onChange={handleInputChange} className='w-5 h-5 accent-accent cursor-pointer' />
                        <label htmlFor='active-toggle' className='text-sm font-semibold text-text cursor-pointer select-none'>
                            Set Discount as Active
                        </label>
                    </div>
                </div>

            </div>

            {feedback && <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type} className="mt-4" />}

            {showScopeSelector && scopeIsSelectable && (
                <ScopeSelectionModal
                    title={formData.scope === 'selected_products' ? 'Select Products' : 'Select Categories'}
                    itemLabel={formData.scope === 'selected_products' ? 'products' : 'categories'}
                    options={currentScopeOptions}
                    selectedValues={selectedScopeOptions}
                    onConfirm={handleScopeSelectionConfirm}
                    onClose={() => setShowScopeSelector(false)}
                />
            )}

            {/* ACTION FOOTER */}
            <div className='flex justify-end mt-6 pt-4 border-t border-main-dark/30'>
                <div className='flex gap-4'>
                    {loading ? (
                        <div className='flex flex-row items-center gap-2 px-4'>
                            <Loader2 size={18} className='animate-spin text-accent' />
                            <h5 className='text-accent-mute font-medium text-md'>Saving...</h5>
                        </div>
                    ) : (
                        <>
                            <Button variant='error' text='Delete' onClick={() => handleDelete(discount.id)} />
                            <Button variant='modalOutline' text='Cancel' onClick={onClose} />
                            <Button variant='modalBlock' text='Update Discount' onClick={submit} />
                        </>
                    )}
                </div>
            </div>

            {confirmation &&
                <ConfirmationModal
                    title={confirmation?.title || ""}
                    content={confirmation?.content || ""}
                    onConfirm={confirmation?.confirm || null}
                    onReject={() => setConfirmation(null)}
                />
            }
        </ModalBody>
    );
};

export default EditDiscountModal;