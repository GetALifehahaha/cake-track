import React, { useMemo } from 'react';
import { ModalBody } from '../../molecules';
import { Button } from '../../atoms';
import { Tag, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const SelectDiscountModal = ({ discounts, cartItems, grossTotal, onSelect, onClose, currentDiscountId=null }) => {

    const processedDiscounts = useMemo(() => {
        const evaluated = discounts.map(discount => {
            let isApplicable = true;
            let reason = "";

            if (discount.start_date && new Date(discount.start_date) > new Date()) {
                isApplicable = false;
                reason = "Discount not active yet";
                return { ...discount, isApplicable, reason };

            } else if (discount.end_date && new Date(discount.end_date) < new Date()) {
                isApplicable = false;
                reason = "Discount has expired";
                return { ...discount, isApplicable, reason };
            }

            if (grossTotal < parseFloat(discount.min_order_total)) {
                isApplicable = false;
                reason = `Minimum order of ₱${discount.min_order_total} required`;
            } else if (discount.scope === 'selected_products') {
                const hasValidProduct = cartItems.some(item => discount.products.includes(item.id));
                if (!hasValidProduct) {
                    isApplicable = false;
                    reason = "No eligible products in cart";
                }
            } else if (discount.scope === 'selected_category') {
                const hasValidCategory = cartItems.some(item => {
                    const itemCategoryIds = item.product.categories.map(c => c.id);
                    return itemCategoryIds.some(id => discount.categories.includes(id));
                });
                if (!hasValidCategory) {
                    isApplicable = false;
                    reason = "No eligible categories in cart";
                }
            }

            return { ...discount, isApplicable, reason };
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

    return (
        <ModalBody title="Select Discount" subtitle="Choose an applicable discount for this transaction" onClose={onClose} className="w-[600px]">
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 pb-2">
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-main-white cursor-pointer hover:bg-main-dark/10 transition-colors" onClick={() => onSelect({id: -1, name: ""})}>
                    <div className="flex items-center gap-3">
                        <div className="bg-main-dark/20 p-2 rounded-full">
                            <Tag size={20} className="text-text/70" />
                        </div>
                        <h5 className="font-semibold text-text text-sm">No Discount</h5>
                    </div>
                    {currentDiscountId == -1 && <CheckCircle2 size={20} className="text-accent" />}
                </div>

                {processedDiscounts.map((discount) => (
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
                                <span className="font-bold text-accent text-lg">
                                    {discount.discount_type === 'percentage' ? `${parseFloat(discount.value)}%` : `₱${parseFloat(discount.value)}`}
                                </span>
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

                {processedDiscounts.length === 0 && (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <Tag size={48} className="text-text/20 mb-4" />
                        <h5 className="text-text/50 font-medium">No discounts available</h5>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-main-dark/30">
                <Button variant="modalOutline" text="Close" onClick={onClose} />
            </div>
        </ModalBody>
    );
};

export default SelectDiscountModal;