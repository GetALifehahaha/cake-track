import React, { useState } from 'react';
import { Button, Dropdown, Label } from '../../atoms';
import { DatePicker, ModalBody, ModalFeedbackCard } from '../../molecules';
import { Loader2 } from 'lucide-react';
import ScopeSelectionModal from './ScopeSelectionModal';
import { limitedInput } from '@/utils/safeInput';

const AddDiscountModal = ({ productOptions, categoryOptions, onConfirm, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showScopeSelector, setShowScopeSelector] = useState(false);

    // Initial date handling for formatting correctly
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // + 30 days

    // Format local to YYYY-MM-DDTHH:mm
    const formatLocalISO = (date) => {
        const offset = date.getTimezoneOffset();
        return new Date(date.getTime() - (offset * 60 * 1000)).toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        name: "",
        discount_type: "percentage",
        value: "",
        scope: "all_products",
        products: [],
        categories: [],
        start_date: formatLocalISO(now),
        end_date: formatLocalISO(future),
        min_order_total: "0",
        usage_limit: "",
        active: true
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
        if (!selectedDate) return;
        setFormData(prev => {
            const timePart = prev[field].split('T')[1];
            const offset = selectedDate.getTimezoneOffset();
            const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
            return { ...prev, [field]: `${localDate}T${timePart}` };
        });

        console.log(formData)
    };

    const handleTimeUpdate = (field, e) => {
        const timePart = e.target.value;
        setFormData(prev => {
            const datePart = prev[field].split('T')[0];
            return { ...prev, [field]: `${datePart}T${timePart}` };
        });
    };

    const validate = () => {
        const parsedValue = Number.parseInt(formData.value, 10);

        if (!formData.name.trim() || !Number.isFinite(parsedValue) || parsedValue <= 0) {
            setFeedback({ label: 'Invalid Fields', details: 'Please enter a valid name and discount value.', type: 'error' });
            return false;
        }
        if (formData.scope === 'selected_products' && formData.products.length === 0) {
            setFeedback({ label: 'Missing Selection', details: 'Please select at least one product.', type: 'error' });
            return false;
        }
        if (formData.scope === 'selected_category' && formData.categories.length === 0) {
            setFeedback({ label: 'Missing Selection', details: 'Please select at least one category.', type: 'error' });
            return false;
        }
        return true;
    };

    const submit = () => {
        if (!validate()) return;
        setLoading(true);
        const payload = { ...formData };
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
        <ModalBody title='Add Discount' onClose={onClose} subtitle='Create a new discount rule' className={'w-[80vw]'}>
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
                        
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Start Date & Time' />
                            <div className='flex gap-2 items-center'>
                                <div className='flex-1'>
                                    <DatePicker date={new Date(formData.start_date.split('T')[0])} selected={formData['start_date']} onSelect={(d) => handleDateUpdate('start_date', d)} />
                                </div>
                                <input type='time' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none border border-border w-1/3' value={formData.start_date.split('T')[1]} onChange={(e) => handleTimeUpdate('start_date', e)} />
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='End Date & Time' />
                            <div className='flex gap-2 items-center'>
                                <div className='flex-1'>
                                    <DatePicker date={new Date(formData.end_date.split('T')[0])} selected={formData['end_date']} onSelect={(d) => handleDateUpdate('end_date', d)} />
                                </div>
                                <input type='time' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none border border-border w-1/3' value={formData.end_date.split('T')[1]} onChange={(e) => handleTimeUpdate('end_date', e)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Rules & Active Status */}
                <div className='flex flex-col gap-6 flex-1'>
                    {/* Rules & Limits Section */}
                    <div className='flex flex-col gap-4'>
                        <h6 className='text-xs text-text/50 font-bold uppercase tracking-wider'>Rules & Limits</h6>
                        
                        <div className='flex flex-col gap-2 w-full pr-3'>
                            <Label variant='modal' text='Scope' />
                            <div className='flex items-center justify-between gap-2 w-full'>
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
                                <div className='mt-2 rounded-md border border-border bg-main-white p-3 w-full'>
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
                            <Button variant='modalOutline' text='Cancel' onClick={onClose} />
                            <Button variant='modalBlock' text='Save Discount' onClick={submit} />
                        </>
                    )}
                </div>
            </div>
        </ModalBody>
    );
};

export default AddDiscountModal;