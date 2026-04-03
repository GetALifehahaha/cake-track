import React, { useMemo, useState } from 'react';
import { ModalBody } from '../../molecules';
import { Button } from '../../atoms';
import { Tag, Clock, AlertCircle, CheckCircle2, Info, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import Modal from '@/components/molecules/Modal';

const SelectDiscountModal = ({ discounts, cartItems, grossTotal, onSelect, onClose, currentDiscountId=null }) => {
    const [selectedDiscountDetail, setSelectedDiscountDetail] = useState(null);
    const [searchText, setSearchText] = useState('');

    const formatMoney = (value) => Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const getItemCategoryIds = (item) => {
        if (Array.isArray(item?.categories)) return item.categories.map(c => c.id);
        if (Array.isArray(item?.product?.categories)) return item.product.categories.map(c => c.id);
        return [];
    };

    const getItemLineTotal = (item) => Number(item?.price || 0) * Number(item?.amount || 0);

    const processedDiscounts = useMemo(() => {
        const evaluated = discounts.map(discount => {
            let isApplicable = true;
            let reason = "";

            const hasUsageLimit = discount.usage_limit !== null && discount.usage_limit !== undefined;
            const usageLimitReached = hasUsageLimit && Number(discount.used_count || 0) >= Number(discount.usage_limit || 0);

            const eligibleItems = cartItems.filter(item => {
                if (discount.scope === 'all_products') return true;
                if (discount.scope === 'selected_products') return (discount.products || []).includes(item.id);
                if (discount.scope === 'selected_category') {
                    const itemCategoryIds = getItemCategoryIds(item);
                    return itemCategoryIds.some(id => (discount.categories || []).includes(id));
                }
                return false;
            });

            const applicableProductNames = [...new Set(eligibleItems.map(item => item.name).filter(Boolean))];

            const applicableBefore = eligibleItems.reduce((sum, item) => sum + getItemLineTotal(item), 0);
            let discountAmount = 0;

            if (discount.discount_type === 'percentage') {
                discountAmount = applicableBefore * (parseFloat(discount.value || 0) / 100);
            } else if (discount.discount_type === 'fixed') {
                discountAmount = parseFloat(discount.value || 0);
            }

            if (discountAmount > applicableBefore) {
                discountAmount = applicableBefore;
            }

            const itemBreakdown = [];
            let distributedDiscount = 0;

            eligibleItems.forEach((item, index) => {
                const itemBefore = getItemLineTotal(item);
                let itemDiscount = 0;

                if (applicableBefore > 0 && discountAmount > 0) {
                    const rawShare = discountAmount * (itemBefore / applicableBefore);
                    itemDiscount = index === eligibleItems.length - 1
                        ? discountAmount - distributedDiscount
                        : Math.round(rawShare * 100) / 100;
                }

                distributedDiscount += itemDiscount;

                itemBreakdown.push({
                    id: item.variant_id || item.id || `${item.name}-${index}`,
                    name: item.name || 'Unnamed item',
                    quantity: Number(item.amount || 0),
                    before: itemBefore,
                    after: Math.max(itemBefore - itemDiscount, 0),
                });
            });

            const applicableAfter = Math.max(applicableBefore - discountAmount, 0);
            const orderAfter = Math.max(grossTotal - discountAmount, 0);

            if (discount.active === false) {
                isApplicable = false;
                reason = "Discount is inactive";
                return { ...discount, isApplicable, reason, applicableBefore, applicableAfter, orderAfter, discountAmount, applicableProductNames, itemBreakdown };
            }

            if (discount.start_date && new Date(discount.start_date) > new Date()) {
                isApplicable = false;
                reason = "Discount not active yet";
                return { ...discount, isApplicable, reason, applicableBefore, applicableAfter, orderAfter, discountAmount, applicableProductNames, itemBreakdown };

            } else if (discount.end_date && new Date(discount.end_date) < new Date()) {
                isApplicable = false;
                reason = "Discount has expired";
                return { ...discount, isApplicable, reason, applicableBefore, applicableAfter, orderAfter, discountAmount, applicableProductNames, itemBreakdown };
            }

            if (usageLimitReached) {
                isApplicable = false;
                reason = "Usage limit reached";
                return { ...discount, isApplicable, reason, applicableBefore, applicableAfter, orderAfter, discountAmount, applicableProductNames, itemBreakdown };
            }

            if (grossTotal < parseFloat(discount.min_order_total)) {
                isApplicable = false;
                reason = `Minimum order of ₱${discount.min_order_total} required`;
            } else if (discount.scope === 'selected_products') {
                const hasValidProduct = applicableBefore > 0;
                if (!hasValidProduct) {
                    isApplicable = false;
                    reason = "No eligible products in cart";
                }
            } else if (discount.scope === 'selected_category') {
                const hasValidCategory = applicableBefore > 0;
                if (!hasValidCategory) {
                    isApplicable = false;
                    reason = "No eligible categories in cart";
                }
            }

            return { ...discount, isApplicable, reason, applicableBefore, applicableAfter, orderAfter, discountAmount, applicableProductNames, itemBreakdown };
        });

        return evaluated.sort((a, b) => {
            if (a.isApplicable === b.isApplicable) return 0;
            return a.isApplicable ? -1 : 1;
        });
    }, [discounts, cartItems, grossTotal]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredDiscounts = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        if (!keyword) {
            return processedDiscounts;
        }

        return processedDiscounts.filter((discount) => {
            const name = String(discount.name || '').toLowerCase();
            const scope = String(discount.scope || '').replaceAll('_', ' ').toLowerCase();
            const products = (discount.applicableProductNames || []).join(' ').toLowerCase();

            return name.includes(keyword) || scope.includes(keyword) || products.includes(keyword);
        });
    }, [processedDiscounts, searchText]);

    return (
        <ModalBody title="Select Discount" subtitle="Choose an applicable discount for this transaction" onClose={onClose} className="w-[600px]">
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 pb-2">
                <div className='sticky top-0 z-10 bg-main pt-1 pb-2'>
                    <div className='flex items-center gap-2 rounded-md border border-border bg-main-white px-3 py-2'>
                        <Search size={14} className='text-text/40' />
                        <input
                            type='text'
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder='Search discount name, scope, or product'
                            className='w-full bg-transparent text-sm focus:outline-none'
                        />
                    </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-main-white cursor-pointer hover:bg-main-dark/10 transition-colors" onClick={() => onSelect({id: -1, name: ""})}>
                    <div className="flex items-center gap-3">
                        <div className="bg-main-dark/20 p-2 rounded-full">
                            <Tag size={20} className="text-text/70" />
                        </div>
                        <h5 className="font-semibold text-text text-sm">No Discount</h5>
                    </div>
                    {currentDiscountId == -1 && <CheckCircle2 size={20} className="text-accent" />}
                </div>

                {filteredDiscounts.map((discount) => (
                    <div 
                        key={discount.id} 
                        onClick={() => discount.isApplicable && onSelect(discount)}
                        className={cn(
                            "flex flex-col gap-2 p-4 border rounded-lg transition-colors relative",
                            discount.isApplicable ? "bg-main-white border-border cursor-pointer hover:border-accent" : "bg-main-dark/5 border-main-dark/20 opacity-60 cursor-not-allowed",
                            currentDiscountId === discount.id && "border-accent bg-accent/5"
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <h5 className="font-bold text-text text-md flex items-center gap-2">
                                    {discount.name}
                                    {currentDiscountId === discount.id && <CheckCircle2 size={16} className="text-accent" />}
                                </h5>
                                <div className="flex items-center gap-2 text-xs text-text/70 font-medium">
                                    <span className="capitalize px-2 py-0.5 bg-main-dark/20 rounded-sm">
                                        {discount.scope.replace('_', ' ')}
                                    </span>
                                    {parseFloat(discount.min_order_total) > 0 && (
                                        <span className="px-2 py-0.5 bg-main-dark/20 rounded-sm">
                                            Min: ₱{discount.min_order_total}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className='flex items-center gap-2'>
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDiscountDetail(discount);
                                        }}
                                        className='p-1 rounded-full border border-main-dark/20 text-text/70 hover:bg-main-dark/10'
                                        aria-label={`Show details for ${discount.name}`}
                                    >
                                        <Info size={14} />
                                    </button>
                                    <span className="font-bold text-accent text-lg">
                                        {discount.discount_type === 'percentage' ? `${parseFloat(discount.value)}%` : `₱${parseFloat(discount.value)}`}
                                    </span>
                                </div>
                                <span className="text-xs text-text/50 uppercase font-bold tracking-wider">
                                    {discount.discount_type === 'percentage' ? 'OFF' : 'FLAT'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-main-dark/10">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-text/60">
                                <Clock size={14} />
                                <span>{formatDate(discount.start_date)} to {formatDate(discount.end_date)}</span>
                            </div>
                            
                            {!discount.isApplicable && (
                                <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={14} />
                                    {discount.reason}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredDiscounts.length === 0 && (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <Tag size={48} className="text-text/20 mb-4" />
                        <h5 className="text-text/50 font-medium">
                            {searchText.trim() ? 'No discounts match your search' : 'No discounts available'}
                        </h5>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-main-dark/30">
                <Button variant="modalOutline" text="Close" onClick={onClose} />
            </div>

            {selectedDiscountDetail &&
                <Modal title="Discount Details" onClose={() => setSelectedDiscountDetail(null)} className="w-[680px]">
                    <div className='flex flex-col gap-4'>
                        <div className='flex items-start justify-between gap-3'>
                            <div>
                                <h5 className='font-semibold text-text text-base'>{selectedDiscountDetail.name}</h5>
                                <h5 className='text-xs text-text/60 capitalize'>
                                    {selectedDiscountDetail.scope.replace('_', ' ')}
                                </h5>
                            </div>
                            <div className='text-right'>
                                <h5 className='font-bold text-accent text-lg'>
                                    {selectedDiscountDetail.discount_type === 'percentage'
                                        ? `${parseFloat(selectedDiscountDetail.value)}%`
                                        : `₱${parseFloat(selectedDiscountDetail.value)}`}
                                </h5>
                                <h5 className='text-xs text-text/50 uppercase font-bold tracking-wider'>
                                    {selectedDiscountDetail.discount_type === 'percentage' ? 'OFF' : 'FLAT'}
                                </h5>
                            </div>
                        </div>

                        <div className='border border-border rounded-md overflow-hidden'>
                            <div className='grid grid-cols-10 gap-2 bg-main-dark/10 px-3 py-2 text-xs font-semibold text-text/70'>
                                <h5 className='col-span-6'>Affected Product</h5>
                                <h5 className='col-span-1 text-right'>Qty</h5>
                                <h5 className='col-span-3 text-right'>Price</h5>
                            </div>

                            <div className='max-h-[35vh] overflow-y-auto'>
                                {selectedDiscountDetail.itemBreakdown?.length > 0 ? (
                                    selectedDiscountDetail.itemBreakdown.map((item) => (
                                        <div key={item.id} className='grid grid-cols-10 gap-2 px-3 py-2 border-t border-main-dark/10 text-sm'>
                                            <h5 className='col-span-6 text-text'>{item.name}</h5>
                                            <h5 className='col-span-1 text-right text-text/80'>{item.quantity}</h5>
                                            <div className='col-span-3 text-right text-text/80 flex gap-2 items-center justify-end'>
                                                <h5 className='line-through'>₱{formatMoney(item.before)} </h5>
                                                <h5 className='font-bold'>₱{formatMoney(item.after)}</h5>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='px-3 py-4 text-sm text-text/60'>No affected products in cart.</div>
                                )}
                            </div>
                        </div>

                        <div className='flex justify-end text-md'>
                            <div className='rounded-md bg-main-dark/5 px-3 py-2'>
                                <h5 className='text-xs text-text/60'>Order Total</h5>
                                <h5 className='font-semibold text-text'>₱{formatMoney(grossTotal)} → ₱{formatMoney(selectedDiscountDetail.orderAfter)}</h5>
                            </div>
                        </div>

                        <div className='flex justify-end'>
                            <Button variant='modalOutline' text='Close' onClick={() => setSelectedDiscountDetail(null)} />
                        </div>
                    </div>
                </Modal>
            }
        </ModalBody>
    );
};

export default SelectDiscountModal;