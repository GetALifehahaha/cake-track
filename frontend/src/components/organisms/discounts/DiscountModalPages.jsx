import { Label, Dropdown, Button } from '@/components/atoms'
import { DatePicker, ModalFeedbackCard } from '@/components/molecules'
import { cn } from '@/lib/utils'
import { inputNumber, inputText, limitedInput } from '@/utils/safeInput'
import React, { useState } from 'react'
import ScopeSelectionModal from './ScopeSelectionModal'
import ConfirmationModal from '../ConfirmationModal'

export const DiscountModalPage1 = ({
    data,
    onSubmit,
    onClose,
    onDanger = null,
    dangerText = 'Delete Discount',
    dangerVariant = 'error',
}) => {

    const [discountData, setDiscountData] = useState({
        name: data?.name || '',
        type: data?.type || 'percentage',
        value: data?.value || 0,
    })

    const [feedback, setFeedback] = useState({ label: "", message: "" })

    const validate = () => {
        const parsedValue = Number.parseFloat(discountData.value)

        if (!discountData.name) {
            setFeedback({
                label: "Invalid Name",
                message: "Please enter a name for the discount."
            })
            return false
        }

        if (!discountData.type) {
            setFeedback({
                label: "Invalid Type",
                message: "Please select a type for the discount."
            })
            return false
        }

        if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
            setFeedback({
                label: "Invalid Value",
                message: "Please enter a valid value for the discount."
            })
            return false
        }

        if (discountData.type === 'percentage' && parsedValue > 100) {
            setFeedback({
                label: 'Invalid Value',
                message: 'Percentage discount cannot exceed 100.'
            })
            return false
        }

        return true
    }

    const submitData = () => {
        if (validate()) {
            onSubmit(discountData);
        }
    }

    const discountTypes = [
        { key: 'Percentage', value: 'percentage' },
        { key: 'Fixed Amount', value: 'fixed' },
    ]

    const handleNameChange = (e) => {
        const val = inputText(e, 50);
        if (val !== undefined) {
            setDiscountData({ ...discountData, name: val });
        }
    }

    const handleValueChange = (e) => {
        const val = inputNumber(e, 13);
        if (val !== undefined) {
            setDiscountData({ ...discountData, value: val });
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
                <Label text='Discount Name' variant='small' />
                <input value={discountData.name.trim()} placeholder='Summer' className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border' type='text' onChange={handleNameChange} />
            </div>

            <div className='flex flex-row gap-4'>
                <div className='flex flex-col gap-2 flex-1'>
                    <Label text='Discount Type' variant='small' />
                    <Dropdown size='full' variant='modal' selection='Select discount type' value={discountData.type} options={discountTypes} allowNone={false} onSelect={(val) => setDiscountData({ ...discountData, type: val })} />
                </div>
                <div className='flex flex-col gap-2 flex-1'>
                    <Label text='Discount Value' variant='small' />
                    <input value={discountData.value} className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border' type='text' onChange={handleValueChange} />
                </div>
            </div>

            {feedback.message && (
                <ModalFeedbackCard type='error' label={feedback.label} details={feedback.message} />
            )}

            <div className={cn('flex gap-2 pt-2 border-t border-border', onDanger ? 'justify-between' : 'justify-end')}>
                {onDanger && (
                    <Button variant={dangerVariant} text={dangerText} onClick={onDanger} />
                )}

                <div className='flex gap-2'>
                    <Button variant='modalOutline' text='Cancel' onClick={onClose} />
                    <Button variant='modalBlock' text='Next' onClick={submitData} />
                </div>
            </div>
        </div>
    )
}

export const DiscountModalPage2 = ({ data, onSubmit, onBack, productOptions = [], categoryOptions = [] }) => {

    const [discountData, setDiscountData] = useState({
        scope: data?.scope || 'all_products',
        min_order_total: data?.min_order_total ?? '0.00',
        usage_limit: data?.usage_limit ?? '',
        active: data?.active ?? true,
        products: data?.products ?? [],
        categories: data?.categories ?? [],
    })

    const [feedback, setFeedback] = useState({ label: "", message: "" })

    const scopeOptions = [
        { key: 'Entire Order', value: 'all_products' },
        { key: 'Selected Products', value: 'selected_products' },
        { key: 'Selected Category', value: 'selected_category' },
    ]

    const [showScopeModal, setShowScopeModal] = useState(false);

    const scopeIsSelectable = discountData.scope === 'selected_products' || discountData.scope === 'selected_category'
    const currentScopeOptions = discountData.scope === 'selected_products' ? productOptions : categoryOptions
    const selectedScopeValues = discountData.scope === 'selected_products' ? discountData.products : discountData.categories
    const selectedScopeSummary = currentScopeOptions.filter((option) => selectedScopeValues.some((id) => String(id) === String(option.value)))
    const selectedTopFive = selectedScopeSummary.slice(0, 5)
    const selectedOverflowCount = selectedScopeSummary.length > 5 ? selectedScopeSummary.length - 5 : 0

    const validate = () => {
        if (!discountData.scope) {
            setFeedback({
                label: 'Invalid Scope',
                message: 'Please select a discount scope.'
            })
            return false
        }

        const parsedMinOrder = Number.parseFloat(discountData.min_order_total || '0')
        if (!Number.isFinite(parsedMinOrder) || parsedMinOrder < 0) {
            setFeedback({
                label: 'Invalid Minimum Order',
                message: 'Minimum order total must be 0 or greater.'
            })
            return false
        }

        if (discountData.usage_limit !== '') {
            const parsedUsageLimit = Number.parseInt(discountData.usage_limit, 10)
            if (!Number.isInteger(parsedUsageLimit) || parsedUsageLimit <= 0) {
                setFeedback({
                    label: 'Invalid Usage Limit',
                    message: 'Usage limit must be a whole number greater than 0.'
                })
                return false
            }
        }

        if (discountData.scope === 'selected_products' && discountData.products.length === 0) {
            setFeedback({
                label: 'Missing Product Selection',
                message: 'Please select at least one product for this scope.'
            })
            return false
        }

        if (discountData.scope === 'selected_category' && discountData.categories.length === 0) {
            setFeedback({
                label: 'Missing Category Selection',
                message: 'Please select at least one category for this scope.'
            })
            return false
        }

        return true
    }

    const submitData = () => {
        if (!validate()) return

        onSubmit({
            scope: discountData.scope,
            min_order_total: discountData.min_order_total === '' ? '0' : discountData.min_order_total,
            usage_limit: discountData.usage_limit,
            active: discountData.active,
            products: discountData.products,
            categories: discountData.categories,
        })
    }

    const handleScopeSelectionConfirm = (selectedValues) => {
        if (discountData.scope === 'selected_products') {
            setDiscountData({ ...discountData, products: selectedValues })
        } else if (discountData.scope === 'selected_category') {
            setDiscountData({ ...discountData, categories: selectedValues })
        }
        setShowScopeModal(false)
    }

    const removeSelectedScopeItem = (value) => {
        if (discountData.scope === 'selected_products') {
            setDiscountData({
                ...discountData,
                products: discountData.products.filter((selected) => String(selected) !== String(value))
            })
            return
        }

        if (discountData.scope === 'selected_category') {
            setDiscountData({
                ...discountData,
                categories: discountData.categories.filter((selected) => String(selected) !== String(value))
            })
        }
    }

    const handleMinOrderChange = (e) => {
        const val = inputNumber(e, 13)
        if (val !== undefined) {
            setDiscountData({ ...discountData, min_order_total: val })
        }
    }

    const handleUsageLimitChange = (e) => {
        const val = limitedInput(e, { maxLength: 11, isNumber: true })
        if (val !== undefined) {
            setDiscountData({ ...discountData, usage_limit: val })
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
                <Label text='Scope' variant='small' />
                <div className='flex items-center gap-2'>
                    <Dropdown
                        variant='modal'
                        size='full'
                        selection='Select scope'
                        value={discountData.scope}
                        options={scopeOptions}
                        allowNone={false}
                        onSelect={(val) => setDiscountData({ ...discountData, scope: val })}
                    />
                    <Button variant='modalOutline' disabled={!scopeIsSelectable} size='small' className='basis-2/3' onClick={() => setShowScopeModal(true)}
                        text={discountData.scope === 'all_products' ? 'All Products Selected' : discountData.scope === 'selected_products' ? 'Select Products' : 'Select Category'} />
                </div>

                {scopeIsSelectable && (
                    <div className='mt-2 rounded-md border border-border bg-main-white p-3'>
                        <div className='flex items-center justify-between'>
                            <h5 className='text-xs font-bold text-accent uppercase tracking-wider'>Selected</h5>
                            <div className='h-6 min-w-6 px-2 rounded-full bg-accent text-main-white text-xs font-semibold flex items-center justify-center'>
                                {selectedScopeSummary.length}
                            </div>
                        </div>

                        {selectedScopeSummary.length > 0 ? (
                            <div className='mt-2 flex flex-wrap gap-2'>
                                {selectedTopFive.map((item) => (
                                    <div key={item.value} className='inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 bg-main'>
                                        <h5 className='text-sm font-medium text-text'>{item.key}</h5>
                                        <button
                                            type='button'
                                            className='text-xs font-bold cursor-pointer h-4 w-4 rounded-full bg-accent-mute/20 text-accent-dark/50'
                                            onClick={() => removeSelectedScopeItem(item.value)}
                                            aria-label={`Remove ${item.key}`}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}

                                {selectedOverflowCount > 0 && (
                                    <h5 className='text-xs text-text/70 self-center'>
                                        {selectedOverflowCount} more...
                                    </h5>
                                )}
                            </div>
                        ) : (
                            <h5 className='mt-2 text-xs text-text/60'>No items selected.</h5>
                        )}
                    </div>
                )}
            </div>

            <div className='flex gap-4'>
                <div className='flex flex-col gap-2 flex-1'>
                    <Label text='Min Order Total (P)' variant='small' />
                    <input
                        value={discountData.min_order_total}
                        className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border'
                        type='text'
                        onChange={handleMinOrderChange}
                    />
                </div>
                <div className='flex flex-col gap-2 flex-1'>
                    <Label text='Usage Limit' variant='small' />
                    <input
                        value={discountData.usage_limit}
                        className='px-4 py-2 rounded-sm bg-main-white focus:outline-none w-full border border-border'
                        type='text'
                        placeholder='No limit'
                        onChange={handleUsageLimitChange}
                    />
                </div>
            </div>

            <div className='flex items-center gap-3'>
                <input
                    type='checkbox'
                    id='discount-page2-active-toggle'
                    checked={discountData.active}
                    onChange={(e) => setDiscountData({ ...discountData, active: e.target.checked })}
                    className='w-5 h-5 accent-accent cursor-pointer'
                />
                <label htmlFor='discount-page2-active-toggle' className='text-sm font-semibold text-text cursor-pointer select-none'>
                    Set Discount as Active
                </label>
            </div>

            {feedback.message && (
                <ModalFeedbackCard type='error' label={feedback.label} details={feedback.message} />
            )}

            <div className='flex justify-end gap-2'>
                <Button variant='modalOutline' text='Back' onClick={onBack} />
                <Button variant='modalBlock' text='Next' onClick={submitData} />
            </div>

            {showScopeModal &&
                <ScopeSelectionModal
                    title={discountData.scope === 'selected_products' ? 'Select Products' : 'Select Categories'}
                    itemLabel={discountData.scope === 'selected_products' ? 'products' : 'categories'}
                    options={currentScopeOptions}
                    selectedValues={selectedScopeValues}
                    onConfirm={handleScopeSelectionConfirm}
                    onClose={() => setShowScopeModal(false)}
                />
            }
        </div>
    )
}

const formatDatePart = (date) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const parseDateTime = (value) => {
    if (!value) return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

const parseTimePart = (value, fallback = '00:00') => {
    if (!value || !value.includes('T')) return fallback
    return (value.split('T')[1] || fallback).slice(0, 5)
}

export const DiscountModalPage3 = ({ data, onSubmit, onBack, loading = false, submitText = 'Save Discount' }) => {
    const [discountData, setDiscountData] = useState({
        is_indefinite: data?.is_indefinite || false,
        start_date: parseDateTime(data?.start_date),
        end_date: parseDateTime(data?.end_date),
        start_time: parseTimePart(data?.start_date, '00:00'),
        end_time: parseTimePart(data?.end_date, '23:59'),
    })

    const [feedback, setFeedback] = useState({ label: '', message: '' })

    const buildDateTime = (date, time) => {
        const datePart = formatDatePart(date)
        if (!datePart) return null
        return `${datePart}T${time}`
    }

    const validate = () => {
        if (!discountData.is_indefinite) {
            if (!discountData.start_date || !discountData.end_date) {
                setFeedback({
                    label: 'Invalid Schedule',
                    message: 'Please provide both start and end date.'
                })
                return false
            }

            const startDateTime = buildDateTime(discountData.start_date, discountData.start_time)
            const endDateTime = buildDateTime(discountData.end_date, discountData.end_time)

            if (!startDateTime || !endDateTime) {
                setFeedback({
                    label: 'Invalid Schedule',
                    message: 'Please provide valid start and end date time values.'
                })
                return false
            }

            if (new Date(startDateTime) >= new Date(endDateTime)) {
                setFeedback({
                    label: 'Invalid Schedule',
                    message: 'End date and time must be later than start date and time.'
                })
                return false
            }
        }

        return true
    }

    const submitData = () => {
        if (!validate()) return

        const startDateTime = discountData.is_indefinite ? null : buildDateTime(discountData.start_date, discountData.start_time)
        const endDateTime = discountData.is_indefinite ? null : buildDateTime(discountData.end_date, discountData.end_time)

        onSubmit({
            is_indefinite: discountData.is_indefinite,
            start_date: startDateTime,
            end_date: endDateTime,
        })
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
                <input
                    type='checkbox'
                    id='discount-page3-indefinite-toggle'
                    checked={discountData.is_indefinite}
                    onChange={(e) => setDiscountData({ ...discountData, is_indefinite: e.target.checked })}
                    className='w-4 h-4 accent-accent cursor-pointer'
                />
                <label htmlFor='discount-page3-indefinite-toggle' className='text-sm text-text font-medium cursor-pointer'>
                    Permanent
                </label>
            </div>

            <div className={cn('', discountData.is_indefinite && 'cursor-not-allowed opacity-50')}>
                <div className={cn('flex flex-col gap-2')}>
                    <Label text='Start Date & Time' variant='small' />
                    <div className='flex gap-2 items-center'>
                        <div className='flex-1'>
                            <DatePicker selected={discountData.start_date} onSelect={(value) => setDiscountData({ ...discountData, start_date: value || null })} />
                        </div>
                        <input
                            type='time'
                            className='px-4 py-2 rounded-sm bg-main-white focus:outline-none border border-border w-1/3'
                            value={discountData.start_time}
                            onChange={(e) => setDiscountData({ ...discountData, start_time: e.target.value })}
                            disabled={discountData.is_indefinite}
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <Label text='End Date & Time' variant='small' />
                    <div className='flex gap-2 items-center'>
                        <div className='flex-1'>
                            <DatePicker selected={discountData.end_date} onSelect={(value) => setDiscountData({ ...discountData, end_date: value || null })} />
                        </div>
                        <input
                            type='time'
                            className='px-4 py-2 rounded-sm bg-main-white focus:outline-none border border-border w-1/3'
                            value={discountData.end_time}
                            onChange={(e) => setDiscountData({ ...discountData, end_time: e.target.value })}
                            disabled={discountData.is_indefinite}
                        />
                    </div>
                </div>
            </div>

            {feedback.message && (
                <ModalFeedbackCard type='error' label={feedback.label} details={feedback.message} />
            )}

            <div className='flex justify-end gap-2'>
                <Button variant='modalOutline' text='Back' onClick={onBack} />
                <Button variant='modalBlock' text={loading ? 'Saving...' : submitText} onClick={submitData} disabled={loading} />
            </div>
        </div>
    )
}

export const DiscountModalPage4 = ({
    data,
    onBack,
    onConfirm,
    loading = false,
    productOptions = [],
    categoryOptions = [],
    originalData = null,
    summaryTitle = 'Summary',
    summarySubtitle = 'Review before creating discount',
    actionText = 'Create Discount',
    confirmTitle = 'Create Discount',
    confirmContent = 'Are you sure you want to create this discount with the above details?',
    confirmActionText = null,
    onDanger = null,
    dangerText = 'Delete',
    dangerVariant = 'error',
}) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const scopeLabelMap = {
        all_products: 'Entire Order',
        selected_products: 'Selected Products',
        selected_category: 'Selected Category',
    }

    const selectedProducts = productOptions.filter((option) => data.products?.some((id) => String(id) === String(option.value)))
    const selectedCategories = categoryOptions.filter((option) => data.categories?.some((id) => String(id) === String(option.value)))
    const originalSelectedProducts = originalData ? productOptions.filter((option) => originalData.products?.some((id) => String(id) === String(option.value))) : []
    const originalSelectedCategories = originalData ? categoryOptions.filter((option) => originalData.categories?.some((id) => String(id) === String(option.value))) : []

    const formatDateTime = (value) => {
        if (!value) return 'N/A'
        return value.replace('T', ' ')
    }

    const listToText = (items) => {
        if (!items || items.length === 0) return 'None'
        return items.map((item) => item.key).join(', ')
    }

    const buildDisplayValues = (source, scopedProducts, scopedCategories) => {
        return {
            name: source.name || '-',
            discount_type: source.discount_type || '-',
            value: source.value || '0',
            scope: scopeLabelMap[source.scope] || source.scope || '-',
            min_order_total: source.min_order_total || '0',
            usage_limit: source.usage_limit || 'No limit',
            active: source.active ? 'Yes' : 'No',
            is_indefinite: source.is_indefinite ? 'Yes' : 'No',
            start_date: source.is_indefinite ? 'N/A' : formatDateTime(source.start_date),
            end_date: source.is_indefinite ? 'N/A' : formatDateTime(source.end_date),
            selected_products: source.scope === 'selected_products' ? listToText(scopedProducts) : 'N/A',
            selected_categories: source.scope === 'selected_category' ? listToText(scopedCategories) : 'N/A',
        }
    }

    const currentDisplay = buildDisplayValues(data, selectedProducts, selectedCategories)
    const originalDisplay = originalData
        ? buildDisplayValues(originalData, originalSelectedProducts, originalSelectedCategories)
        : null

    const baseDiffFields = [
        ['Name', 'name'],
        ['Type', 'discount_type'],
        ['Value', 'value'],
        ['Scope', 'scope'],
        ['Min Order Total', 'min_order_total'],
        ['Usage Limit', 'usage_limit'],
        ['Active', 'active'],
        ['Permanent', 'is_indefinite'],
        ['Start Date & Time', 'start_date'],
        ['End Date & Time', 'end_date'],
    ]

    const scopedDiffFields = [
        ['Selected Products', 'selected_products'],
        ['Selected Categories', 'selected_categories'],
    ]

    const diffRows = originalDisplay
        ? [...baseDiffFields, ...scopedDiffFields]
            .map(([label, key]) => ({
                label,
                before: originalDisplay[key],
                after: currentDisplay[key],
            }))
            .filter((row) => row.before !== row.after)
        : []

    return (
        <div className='flex flex-col gap-4'>
            <div className='rounded-md border border-border bg-main-white p-4 flex flex-col gap-4 overflow-auto h-[40vh]'>
                <div className='flex items-center justify-between border-b border-border pb-2'>
                    <h5 className='text-sm font-bold text-accent uppercase tracking-wider'>{summaryTitle}</h5>
                    <h5 className='text-xs text-text/60'>{summarySubtitle}</h5>
                </div>

                {originalData && diffRows.length > 0 && (
                    <div className='rounded-md border border-accent/20 bg-accent/5 p-3'>
                        <h5 className='text-xs font-semibold text-accent uppercase tracking-wider mb-2'>Changes Detected</h5>
                        <div className='grid grid-cols-[1fr_1fr_1fr] gap-2 text-xs'>
                            <h5 className='font-semibold text-text/70'>Field</h5>
                            <h5 className='font-semibold text-text/70'>Before</h5>
                            <h5 className='font-semibold text-text/70'>After</h5>

                            {diffRows.map((row) => (
                                <React.Fragment key={row.label}>
                                    <h5 className='text-text/70'>{row.label}</h5>
                                    <h5 className='text-text/60'>{row.before}</h5>
                                    <h5 className='text-text font-medium'>{row.after}</h5>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                <div className='grid grid-cols-2 gap-3 text-sm'>
                    <h5 className='text-text/60'>Name</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.name}</h5>
                    <h5 className='text-text/60'>Type</h5>
                    <h5 className='font-medium text-text text-right capitalize'>{currentDisplay.discount_type}</h5>
                    <h5 className='text-text/60'>Value</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.value}</h5>
                    <h5 className='text-text/60'>Scope</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.scope}</h5>
                    <h5 className='text-text/60'>Min Order Total</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.min_order_total}</h5>
                    <h5 className='text-text/60'>Usage Limit</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.usage_limit}</h5>
                    <h5 className='text-text/60'>Active</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.active}</h5>
                    <h5 className='text-text/60'>Permanent</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.is_indefinite}</h5>
                    <h5 className='text-text/60'>Start Date & Time</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.start_date}</h5>
                    <h5 className='text-text/60'>End Date & Time</h5>
                    <h5 className='font-medium text-text text-right'>{currentDisplay.end_date}</h5>
                </div>

                {data.scope === 'selected_products' && (
                    <div className='pt-2 border-t border-border'>
                        <h5 className='text-xs font-semibold text-text/60 uppercase tracking-wider mb-2'>Selected Products ({selectedProducts.length})</h5>
                        <div className='flex flex-wrap gap-2'>
                            {selectedProducts.length > 0 ? selectedProducts.map((item) => (
                                <span key={item.value} className='px-3 py-1 rounded-full border border-border text-xs text-text bg-main'>
                                    {item.key}
                                </span>
                            )) : <h5 className='text-xs text-text/60'>No products selected.</h5>}
                        </div>
                    </div>
                )}

                {data.scope === 'selected_category' && (
                    <div className='pt-2 border-t border-border'>
                        <h5 className='text-xs font-semibold text-text/60 uppercase tracking-wider mb-2'>Selected Categories ({selectedCategories.length})</h5>
                        <div className='flex flex-wrap gap-2'>
                            {selectedCategories.length > 0 ? selectedCategories.map((item) => (
                                <span key={item.value} className='px-3 py-1 rounded-full border border-border text-xs text-text bg-main'>
                                    {item.key}
                                </span>
                            )) : <h5 className='text-xs text-text/60'>No categories selected.</h5>}
                        </div>
                    </div>
                )}
            </div>

            <div className='flex justify-end gap-2 pt-2 border-t border-border'>
                {onDanger && (
                    <Button onClick={onDanger} text={dangerText} variant={dangerVariant} />
                )}
                <Button onClick={onBack} text='Back' variant='modalOutline' />
                <Button onClick={() => setShowConfirmModal(true)} text={actionText} variant='modalBlock' disabled={loading} />
            </div>

            {showConfirmModal && (
                <ConfirmationModal
                    title={confirmTitle}
                    content={confirmContent}
                    confirmText={confirmActionText || actionText}
                    onConfirm={async () => {
                        setShowConfirmModal(false)
                        await onConfirm()
                    }}
                    onReject={() => setShowConfirmModal(false)}
                />
            )}
        </div>
    )
}