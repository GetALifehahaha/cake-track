import React, { useState, useMemo, useEffect } from 'react'
import { Dropdown, Button, Label, Title } from '../components/atoms'
import { CheckoutProduct, ModalFeedbackCard, Pagination, ProductCard } from '../components/molecules'
import { PaymentModal, PaymentSuccessModal, ClearCheckoutModal, VariantModal, HomeSkeleton, SelectDiscountModal, PendingOrdersModal } from '../components/organisms/'
import { Lock } from 'lucide-react'
import useProduct from '@/hooks/useProduct'
import { useSearchParams } from 'react-router-dom'
import useTransaction from '@/hooks/useTransaction'
import useCategory from '@/hooks/useCategory'
import useDiscount from '@/hooks/useDiscount'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'
import Modal from '@/components/molecules/Modal'
import useBusinessDetails from '@/hooks/useBusinessDetails'
import api from '@/api/api'
import API_ENDPOINTS from '@/api/endpoints'

const Home = () => {

    const { addToast } = useToast();
    const { user } = useAuth();

    const [, setSearchParams] = useSearchParams();
    const { data: productData, loading: productLoading, error: productError, refresh: refreshProducts } = useProduct();
    const {
        postTransaction,
        completeTransaction,
        pendingData,
        pendingLoading,
        refreshPending,
        loading: transactionLoading,
        error: transactionError,
    } = useTransaction();
    const { data: businessData, loading: businessLoading, error: businessError } = useBusinessDetails();
    const { categoryData, categoryLoading, categoryError } = useCategory();
    const { discountData, discountLoading, discountError } = useDiscount({ all: true });
    const [checkoutProducts, setCheckoutProducts] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [voidProducts, setVoidProducts] = useState([]);

    const [grossTotal, setGrossTotal] = useState(0);
    const [discount, setDiscount] = useState({ id: -1, name: "" });
    const [netTotal, setNetTotal] = useState(0);
    const [receivedPayment, setReceivedPayment] = useState(0);
    const [completedTransaction, setCompletedTransaction] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [orderType, setOrderType] = useState("dine-in");
    const [filter, setFilter] = useState();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
    const [showClearCheckoutModal, setShowClearCheckoutModal] = useState(false);
    const [showVoid, setShowVoid] = useState(false);
    const [prepProduct, setPrepProduct] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);
    const [completingOrderId, setCompletingOrderId] = useState(null);
    const [completingAllOrders, setCompletingAllOrders] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [loadingAccessCode, setLoadingAccessCode] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [modalFeedbackContent, setModalFeedbackContent] = useState({});
    const [showModalFeedback, setShowModalFeedback] = useState(false);

    const productResults = Array.isArray(productData?.results) ? productData.results : [];

    const getVariantMaxOrderable = (variant) => {
        if (!variant) return 0;

        if (!variant.has_recipe) return 99;
        if (variant.recipe_available === false) return 0;

        const ingredients = Array.isArray(variant?.recipe_details?.ingredients)
            ? variant.recipe_details.ingredients
            : [];

        if (!ingredients.length) return 0;

        let maxOrderable = Infinity;

        for (const ingredient of ingredients) {
            const amountNeeded = Number(ingredient?.amount_needed || 0);
            const ingredientStock = Number(ingredient?.ingredient_stock || 0);

            if (!Number.isFinite(amountNeeded) || amountNeeded <= 0) {
                return 0;
            }

            const perIngredientMax = Math.floor(ingredientStock / amountNeeded);
            maxOrderable = Math.min(maxOrderable, perIngredientMax);
        }

        if (!Number.isFinite(maxOrderable)) return 0;
        if (maxOrderable < 0) return 0;

        return Math.min(maxOrderable, 99);
    };

    const getProductAndVariantByVariantId = (variantId) => {
        const matchedProduct = productResults.find((product) =>
            Array.isArray(product?.variants) && product.variants.some((variant) => Number(variant.id) === Number(variantId)),
        );
        const matchedVariant = matchedProduct?.variants?.find((variant) => Number(variant.id) === Number(variantId));

        return { matchedProduct, matchedVariant };
    };

    const sanitizeCheckoutProducts = async (items, { notify = true } = {}) => {
        if (!Array.isArray(items) || items.length === 0) {
            return { sanitized: [], removedCount: 0 };
        }

        const validShapeItems = items.filter((item) => {
            const productId = Number(item?.id);
            const variantId = Number(item?.variant_id);
            const quantity = Number(item?.amount);

            return Number.isFinite(productId) && Number.isFinite(variantId) && Number.isFinite(quantity) && quantity > 0;
        });

        const productIds = [...new Set(validShapeItems.map((item) => Number(item.id)))];
        const productMap = new Map();

        await Promise.all(productIds.map(async (productId) => {
            try {
                const response = await api.get(`${API_ENDPOINTS.PRODUCTS}${productId}/`);
                productMap.set(productId, response.data);
            } catch {
                productMap.set(productId, null);
            }
        }));

        const sanitized = validShapeItems.reduce((list, item) => {
            const productId = Number(item.id);
            const variantId = Number(item.variant_id);
            const product = productMap.get(productId);

            if (!product || product.is_archived) return list;

            const variant = Array.isArray(product.variants)
                ? product.variants.find((entry) => Number(entry.id) === variantId)
                : null;

            if (!variant) return list;

            const maxOrderable = getVariantMaxOrderable(variant);
            if (maxOrderable < 1) return list;

            const boundedAmount = Math.max(1, Math.min(Number(item.amount), maxOrderable));

            list.push({
                ...item,
                id: product.id,
                name: product.name,
                variant_id: variant.id,
                label: variant.label,
                price: Number(variant.price),
                amount: boundedAmount,
            });

            return list;
        }, []);

        const removedCount = items.length - sanitized.length;

        if (notify && removedCount > 0) {
            addToast(`${removedCount} outdated cart item(s) were removed after product updates.`, 'info');
        }

        return { sanitized, removedCount };
    };

    // SET AND TOGGLES

    const handleSetFilter = (value) => {
        setSearchParams(prevParams => {
            if (value) {
                prevParams.set('categories__name', value);
            } else {
                prevParams.delete('categories__name');
            }
            return prevParams;
        });

        setFilter(value)
    };

    const handleSetOrderType = (value) => setOrderType(value);

    const handleRemoveProductFromCheckout = (id) => {
        setCheckoutProducts(checkoutProducts => checkoutProducts.filter(product => product.id != id))
    }

    const handleSetAmount = (id, value) => {
        const { matchedVariant } = getProductAndVariantByVariantId(id);
        const maxOrderable = getVariantMaxOrderable(matchedVariant);

        if (value < 1) {
            addToVoid(checkoutProducts.find(product => product.variant_id == id));
            setShowVoid(true);
        }

        setCheckoutProducts(prod => {
            let products = prod;

            products = products.map(product => {
                if (product.variant_id == id) {
                    const clampedValue = Math.max(1, Math.min(Number(value || 1), maxOrderable || 1));
                    product.amount = clampedValue
                }

                return product;
            })

            if (maxOrderable < 1) {
                return products.filter((product) => Number(product.variant_id) !== Number(id));
            }

            return products

        })
    }

    const handleTogglePaymentSuccessModal = () => {
        removeAllProducts();
        setCompletedTransaction(null);
        setShowPaymentSuccessModal(!showPaymentSuccessModal);
    }

    const itemInVoid = (variant_id) => {
        return voidProducts.some(prod => prod.variant_id == variant_id);
    }

    // USE EFFECTS AND MEMOS

    useMemo(() => {
        setGrossTotal(() => {
            let total = 0;

            checkoutProducts.forEach(prod => total += prod.price * prod.amount);

            return total;
        })
    }, [checkoutProducts]);

    const selectedDiscount = useMemo(() => {
        if (!discount?.id || discount.id === -1) return null;
        return discountData.find(d => d.id === discount.id) || null;
    }, [discount, discountData]);

    const discountBreakdown = useMemo(() => {
        const itemMap = {};
        checkoutProducts.forEach((product) => {
            const lineTotal = Number(product.price || 0) * Number(product.amount || 0);
            itemMap[product.variant_id] = {
                before: lineTotal,
                after: lineTotal,
                isApplicable: false,
            };
        });

        if (!selectedDiscount) {
            return {
                itemPricing: itemMap,
                totalDiscount: 0,
                net: grossTotal,
            };
        }

        const getItemCategoryIds = (item) => {
            if (Array.isArray(item?.categories)) return item.categories.map(c => c.id);
            if (Array.isArray(item?.product?.categories)) return item.product.categories.map(c => c.id);
            return [];
        };

        const isEligible = (item) => {
            if (selectedDiscount.scope === 'all_products') return true;
            if (selectedDiscount.scope === 'selected_products') {
                return (selectedDiscount.products || []).includes(item.id);
            }
            if (selectedDiscount.scope === 'selected_category') {
                const itemCategoryIds = getItemCategoryIds(item);
                return itemCategoryIds.some(id => (selectedDiscount.categories || []).includes(id));
            }
            return false;
        };

        const eligibleItems = checkoutProducts.filter(isEligible);
        const eligibleTotal = eligibleItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.amount || 0), 0);

        if (
            eligibleTotal <= 0 ||
            grossTotal < Number(selectedDiscount.min_order_total || 0)
        ) {
            return {
                itemPricing: itemMap,
                totalDiscount: 0,
                net: grossTotal,
            };
        }

        let totalDiscount = 0;
        if (selectedDiscount.discount_type === 'percentage') {
            totalDiscount = eligibleTotal * (Number(selectedDiscount.value || 0) / 100);
        } else if (selectedDiscount.discount_type === 'fixed') {
            totalDiscount = Math.min(Number(selectedDiscount.value || 0), eligibleTotal);
        }

        let distributed = 0;
        eligibleItems.forEach((item, index) => {
            const lineTotal = Number(item.price || 0) * Number(item.amount || 0);
            const rawShare = totalDiscount * (lineTotal / eligibleTotal);
            const lineDiscount = index === eligibleItems.length - 1
                ? totalDiscount - distributed
                : Math.round(rawShare * 100) / 100;

            distributed += lineDiscount;

            itemMap[item.variant_id] = {
                before: lineTotal,
                after: Math.max(lineTotal - lineDiscount, 0),
                isApplicable: lineDiscount > 0,
            };
        });

        const normalizedDiscount = Math.round(totalDiscount * 100) / 100;
        return {
            itemPricing: itemMap,
            totalDiscount: normalizedDiscount,
            net: Math.max(grossTotal - normalizedDiscount, 0),
        };
    }, [checkoutProducts, selectedDiscount, grossTotal]);

    useMemo(() => {
        setNetTotal(discountBreakdown.net);
    }, [discountBreakdown.net])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(checkoutProducts));
    }, [checkoutProducts]);

    useEffect(() => {
        let mounted = true;

        const syncPersistedCart = async () => {
            if (!checkoutProducts.length) return;

            const { sanitized, removedCount } = await sanitizeCheckoutProducts(checkoutProducts, { notify: true });
            if (!mounted || removedCount <= 0) return;

            setCheckoutProducts(sanitized);
            setVoidProducts((current) => current.filter((item) => sanitized.some((validItem) => validItem.variant_id === item.variant_id)));
        };

        syncPersistedCart();

        return () => {
            mounted = false;
        };
    }, []);


    // GUARDS

    if (productLoading || categoryLoading || transactionLoading || discountLoading || businessLoading) return <HomeSkeleton />
    if (productError) return <h5>Error</h5>
    if (categoryError) return <h5>Error</h5>
    if (transactionError) return <h5>Error</h5>
    if (discountError) return <h5>Error</h5>
    if (businessError) return <h5>Error</h5>


    // MAIN FUNCTIONS

    const addToCheckout = (product, amount) => {
        const { matchedVariant } = getProductAndVariantByVariantId(product.variant_id);
        const maxOrderable = getVariantMaxOrderable(matchedVariant);

        if (maxOrderable < 1) {
            addToast('Insufficient ingredients for this variant.', 'error');
            return;
        }

        setCheckoutProducts(prev => {
            if (prev.some(prod => prod.variant_id === product.variant_id)) {
                return prev
            }

            const boundedAmount = Math.max(1, Math.min(Number(amount || 1), maxOrderable));
            return [...prev, { ...product, amount: boundedAmount }]
        })

        setPrepProduct(null)
        setModalFeedbackContent(null)
    }

    const selectDiscount = (discount) => {
        const hasUsageLimit = discount?.usage_limit !== null && discount?.usage_limit !== undefined;
        const usageLimitReached = hasUsageLimit && Number(discount?.used_count || 0) >= Number(discount?.usage_limit || 0);

        if (usageLimitReached) {
            addToast('Discount usage limit has been reached.', 'error');
            return;
        }

        setDiscount({ id: discount.id, name: discount.name })

        setShowDiscountModal(false);
    }


    const handlePrepProduct = (product) => {
        if (product.variants.length === 1) {
            const singleVariant = product.variants[0];
            const maxOrderable = getVariantMaxOrderable(singleVariant);

            if (maxOrderable < 1) {
                addToast('Insufficient ingredients for this variant.', 'error');
                return;
            }

            addToCheckout({
                ...product,
                variant_id: singleVariant.id,
                label: singleVariant.label,
                price: singleVariant.price,
            }, 1)
        }
        else setPrepProduct(product)
    }

    const toggleAllVoidItems = () => {
        if (checkoutProducts.length === voidProducts.length) {
            setVoidProducts([]);
        } else {
            setVoidProducts(checkoutProducts);
        }
    }

    const addToVoid = (product) => {
        setVoidProducts(vp => {
            let prod = [...vp];

            if (itemInVoid(product.variant_id)) {
                return prod.filter(p => p.variant_id != product.variant_id);
            }

            return [...prod, product];
        })
    }

    const proceedToCheckout = () => {
        if (!checkoutProducts.length) {
            addToast('Add at least one product to checkout.', 'error');
            return;
        }

        setShowPaymentModal(true);
    }


    const confirmAccessCode = async () => {
        setLoadingAccessCode(true);
        try {
            await api.post('/pos/transactions/verify-void-pin/', {
                pin: accessCode,
            });

            voidPayment();
        } catch {
            setModalFeedbackContent({
                type: "error",
                label: "Wrong Access Code",
                details: "Please enter the correct access code"
            })
            setShowModalFeedback(true);
        } finally {
            setLoadingAccessCode(false);
        }
    }

    const pendingTransactions = (Array.isArray(pendingData?.results) ? pendingData.results : [])
        .filter((transaction) => !transaction.is_void);
    const pendingOrdersCount = pendingTransactions.length;

    const handleCompletePendingOrder = async (transactionId) => {
        if (completingAllOrders) return;

        try {
            setCompletingOrderId(transactionId);
            await completeTransaction(transactionId);
            await refreshProducts();
            addToast('Order marked as completed', 'success');
            refreshPending();
        } catch (error) {
            const detail = error?.response?.data?.detail || 'Failed to complete order';
            addToast(detail, 'error');
        } finally {
            setCompletingOrderId(null);
        }
    }

    const handleCompleteAllPendingOrders = async () => {
        if (completingAllOrders || completingOrderId !== null) return;

        const orderIds = pendingTransactions
            .map((transaction) => transaction?.id)
            .filter((id) => id !== null && id !== undefined && String(id).trim() !== '');

        if (orderIds.length === 0) return;

        try {
            setCompletingAllOrders(true);

            let succeeded = 0;
            let failed = 0;
            let firstError = null;

            for (const orderId of orderIds) {
                try {
                    await completeTransaction(orderId);
                    succeeded += 1;
                } catch (error) {
                    failed += 1;
                    if (!firstError) {
                        firstError = error;
                    }
                }
            }

            if (succeeded > 0) {
                await refreshProducts();
                addToast(
                    succeeded === 1 ? '1 order marked as completed' : `${succeeded} orders marked as completed`,
                    'success',
                );
            }

            if (failed > 0) {
                const detail = firstError?.response?.data?.detail || `${failed} order(s) could not be completed`;
                addToast(detail, 'error');
            }

            await refreshPending();
        } catch {
            addToast('Failed to complete pending orders', 'error');
        } finally {
            setCompletingAllOrders(false);
        }
    }

    const completePayment = async (payload) => {
        setPaymentLoading(true);

        if (payload) {
            const { sanitized: sanitizedCheckoutProducts, removedCount } = await sanitizeCheckoutProducts(checkoutProducts, { notify: true });

            if (removedCount > 0) {
                setCheckoutProducts(sanitizedCheckoutProducts);
                setVoidProducts((current) => current.filter((item) => sanitizedCheckoutProducts.some((validItem) => validItem.variant_id === item.variant_id)));
            }

            const parsedValue = parseFloat(
                typeof payload === 'object' ? payload?.receivedPayment : payload,
            );
            const submittedCustomerName =
                typeof payload === 'object' ? payload?.customerName : (customerName?.trim() || null);

            // Validation
            if (!sanitizedCheckoutProducts || sanitizedCheckoutProducts.length === 0) {
                setModalFeedbackContent({ type: "error", label: "No Items", details: "Add at least one product before completing a transaction." });
                setShowModalFeedback(true);
                return;
            }

            const invalidItem = sanitizedCheckoutProducts.find(p => !p.id || !p.variant_id || !p.amount || p.amount <= 0);
            if (invalidItem) {
                setModalFeedbackContent({ type: "error", label: "Invalid Item", details: `Item "${invalidItem.name || 'Unknown'}" is missing required details (variant or quantity).` });
                setShowModalFeedback(true);
                return;
            }

            if (!orderType) {
                setModalFeedbackContent({ type: "error", label: "Missing Order Type", details: "Please select an order type (Dine In or Take Out) before proceeding." });
                setShowModalFeedback(true);
                return;
            }

            if (!Number.isFinite(parsedValue) || parsedValue < 0) {
                setModalFeedbackContent({ type: "error", label: "Invalid Payment", details: "Please enter a valid payment amount." });
                setShowModalFeedback(true);
                return;
            }

            if (parsedValue < netTotal) {
                setModalFeedbackContent({ type: "error", label: "Insufficient Payment", details: "The payment amount is less than the total due." });
                setShowModalFeedback(true);
                return;
            }

            const checkoutProductsPayload = sanitizedCheckoutProducts.map(p => ({
                product: p.id,
                product_variant: p.variant_id,
                quantity: p.amount,
            }))

            const transactionResponse = await postTransaction({
                is_void: false,
                is_completed: false,
                payment_method: "cash",
                order_type: orderType,
                customer_name: submittedCustomerName,
                transaction_items: checkoutProductsPayload,
                paid_amount: parsedValue,
                discount: discount.id !== -1 ? discount.id : null
            })

            await refreshProducts();
            refreshPending();

            const receiptItems = sanitizedCheckoutProducts.map(p => {
                const pricing = discountBreakdown.itemPricing[p.variant_id] || {
                    before: Number(p.price || 0) * Number(p.amount || 0),
                    after: Number(p.price || 0) * Number(p.amount || 0),
                    isApplicable: false,
                };

                return {
                    quantity: p.amount,
                    product: {
                        id: p.id,
                        name: p.name,
                    },
                    product_variant: {
                        id: p.variant_id,
                        label: p.label,
                        price: p.price,
                    },
                    line_total_before: pricing.before,
                    line_total_after: pricing.after,
                    line_discount: Math.max(Number(pricing.before || 0) - Number(pricing.after || 0), 0),
                };
            });

            const localReceiptTransaction = {
                id: null,
                display_id: '',
                is_local: true,
                created_at: transactionResponse?.data?.created_at || new Date().toISOString(),
                is_void: false,
                payment_method: "cash",
                order_type: orderType,
                customer_name: submittedCustomerName,
                gross_total: grossTotal,
                net_total: netTotal,
                paid_amount: parsedValue,
                change: parsedValue - netTotal,
                discount: discount.name || null,
                cashier: {
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                },
                transaction_items: receiptItems,
            };

            const serverTransaction = transactionResponse?.data || null;
            const completedReceiptTransaction = serverTransaction
                ? {
                    ...serverTransaction,
                    customer_name: serverTransaction.customer_name || submittedCustomerName || null,
                    gross_total: grossTotal,
                    net_total: netTotal,
                    paid_amount: parsedValue,
                    change: parsedValue - netTotal,
                    discount: serverTransaction.discount || (discount.id !== -1 ? { name: discount.name } : null),
                    transaction_items: receiptItems,
                }
                : localReceiptTransaction;

            setCompletedTransaction(completedReceiptTransaction);
            setReceivedPayment(parsedValue);
            setCustomerName("");
            setDiscount({ id: -1, name: '' })
            setShowPaymentSuccessModal(true);
            removeAllProducts();

            addToast("Transaction successful")
        }
        setShowPaymentModal(false);
        setModalFeedbackContent(null);
        setPaymentLoading(false)
    }

    const removeAllProducts = () => {
        setCheckoutProducts([]);
    };

    const confirmVoidPayment = () => {
        if (voidProducts.length > 0) setShowClearCheckoutModal(true);
    }

    const voidPayment = async () => {
        const { sanitized: sanitizedCheckoutProducts, removedCount } = await sanitizeCheckoutProducts(checkoutProducts, { notify: true });

        if (removedCount > 0) {
            setCheckoutProducts(sanitizedCheckoutProducts);
            setVoidProducts((current) => current.filter((item) => sanitizedCheckoutProducts.some((validItem) => validItem.variant_id === item.variant_id)));
        }

        const sanitizedVoidProducts = voidProducts.filter((item) => sanitizedCheckoutProducts.some((validItem) => validItem.variant_id === item.variant_id));

        if (!sanitizedVoidProducts || sanitizedVoidProducts.length === 0) {
            setModalFeedbackContent({ type: "error", label: "No Items", details: "Select at least one item to void." });
            setShowModalFeedback(true);
            return;
        }

        const invalidVoidItem = sanitizedVoidProducts.find(p => !p.id || !p.variant_id || !p.amount || p.amount <= 0);
        if (invalidVoidItem) {
            setModalFeedbackContent({ type: "error", label: "Invalid Item", details: `Item "${invalidVoidItem.name || 'Unknown'}" is missing required details and cannot be voided.` });
            setShowModalFeedback(true);
            return;
        }

        if (!orderType) {
            setModalFeedbackContent({ type: "error", label: "Missing Order Type", details: "Order type is missing. Cannot process the void." });
            setShowModalFeedback(true);
            return;
        }

        const voidProductsPayload = sanitizedVoidProducts.map(p => ({
            product: p.id,
            product_variant: p.variant_id,
            quantity: p.amount,
        }))

        await postTransaction({
            is_void: true,
            is_completed: true,
            payment_method: "cash",
            transaction_items: voidProductsPayload,
            paid_amount: 0,
            order_type: orderType,
        })

        setCheckoutProducts(cp => cp.filter(p => !itemInVoid(p.variant_id)));
        setVoidProducts([]);
        addToast("Transction voided successfully");
        setAccessCode('');
        localStorage.removeItem('cart');

        setShowClearCheckoutModal(false);
    }


    // LISTS AND OPTIONS

    const enrichedProductResults = productResults.map((product) => {
        const variants = (product?.variants || []).map((variant) => {
            const maxOrderable = getVariantMaxOrderable(variant);
            return {
                ...variant,
                maxOrderable,
                isInsufficient: maxOrderable < 1,
            };
        });

        const allVariantsInsufficient = variants.length > 0 && variants.every((variant) => variant.isInsufficient);

        return {
            ...product,
            variants,
            isUnavailable: allVariantsInsufficient,
        };
    });

    const listCheckoutProducts = checkoutProducts.map((product, index) =>
        <CheckoutProduct
            key={index}
            product={product}
            maxAmount={(() => {
                const { matchedVariant } = getProductAndVariantByVariantId(product.variant_id);
                return getVariantMaxOrderable(matchedVariant);
            })()}
            pricing={discountBreakdown.itemPricing[product.variant_id]}
            onChangeAmount={handleSetAmount}
            onToggle={handleRemoveProductFromCheckout} />
    )

    const listProduct = enrichedProductResults.map((product) =>
        <ProductCard
            product={product}
            key={product.id}
            isPOS={true}
            isSelected={checkoutProducts.some(p => p.variant_id == product.variant_id)}
            onToggle={handlePrepProduct} />
    )

    const listVoidProducts = checkoutProducts.map((product) =>
        <div
            key={product.variant_id}
            className={cn('relative flex flex-row border-2 border-border rounded-xl gap-8 w-full items-center px-4 py-1.5 cursor-pointer hover:bg-border active:-translate-y-2 transition-transform duration-200', { 'opacity-50': itemInVoid(product.variant_id) })}
            onClick={() => addToVoid(product)}
        >
            {itemInVoid(product.variant_id) &&
                <div className='bg-error w-2 h-2 aspect-square rounded-sm absolute -translate-x-5' />
            }

            <div>
                <h5 className='font-medium text-sm'>{product.name}</h5>
                <div className='flex items-center gap-2'>
                    <h5 className='font-semibold text-accent-text text-sm'>₱ {Number(product.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                    <h5 className='font-semibold text-xs p-0.5 bg-white text-accent border rounded-md px-1 min-w-8 text-center border-accent'>{product.label}</h5>
                </div>
            </div>
        </div>
    )

    const categoryOptions = categoryData.map((cat) => { return { key: cat.name, value: cat.id } });

    return (
        <div className='flex gap-4 w-full h-full'>
            {/* Middle */}
            <div className='flex-1 flex flex-col gap-4'>
                <div className='flex flex-row gap-1 items-center'>
                    <Dropdown value={filter} selection="Filter Product" size='regular' forPageFilter={true} options={categoryOptions} onSelect={handleSetFilter} />
                    {(pendingLoading || pendingOrdersCount > 0) && (
                        <div className='ml-auto'>
                            <Button
                                variant='modalBlock'
                                size='small'
                                className='bg-accent'
                                text={pendingLoading ? 'Pending Orders (...)' : `Pending Orders (${pendingOrdersCount})`}
                                onClick={() => setShowPendingOrdersModal(true)}
                            />
                        </div>
                    )}
                </div>

                {/* Product Section */}
                {enrichedProductResults.length == 0 ?
                    <div className='flex justify-center items-center h-full'>
                        <h5 className='text-sm font-medium text-text/50'>
                            No products to show
                        </h5>
                    </div>
                    :
                    <div className='h-[70vh] overflow-y-auto flex items-center flex-col gap-2'>
                        <div className='grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-2 gap-4 w-full flex-wrap'>
                            {listProduct}
                        </div>
                    </div>
                }
                <Pagination prev={productData.previous} next={productData.next} />
            </div>


            {/* Checkout Section */}
            <div className='basis-1/4 flex flex-col gap-4'>
                <div className='w-full h-full bg-main-white rounded-4xl shadow-md shadow-black/25 flex flex-col'>
                    <div className='flex flex-row justify-between items-center text-text px-4 py-8'>
                        <div>
                            <h5 className='font-bold text-xl'>Current Order</h5>
                        </div>
                        <Button variant='outline' text={showVoid ? 'Cancel' : 'Clear'} onClick={() => { setShowVoid(!showVoid); setVoidProducts([]) }} />
                    </div>

                    <div className='flex flex-row gap-2 p-1.5 bg-main-dark/25 w-[97.5%] mx-auto rounded-xl'>
                        <Button
                            className='flex-1 rounded-lg'
                            variant={(orderType == "dine-in") ? 'active' : 'inactive'} size='small' text='Dine In' onClick={() => handleSetOrderType("dine-in")} />
                        <Button
                            className='flex-1 rounded-lg'
                            variant={(orderType == "take-out") ? 'active' : 'inactive'} size='small' text='Take Out' onClick={() => handleSetOrderType("take-out")} />
                    </div>

                    <div className={cn('px-4 py-8 flex flex-col gap-4 h-[45vh] overflow-y-auto', showVoid && 'h-[50vh]')}>
                        {showVoid ?

                            listVoidProducts
                            :
                            listCheckoutProducts
                        }
                    </div>

                    {showVoid ?
                        <div className='mt-auto ml-auto w-full border-t border-l border-r py-6 px-8 border-border rounded-2xl flex flex-col gap-4'>
                            <div className='flex flex-row items-center justify-between w-full mb-2'>
                                <h5 className='font-semibold text-sm text-text/50'>
                                    {voidProducts.length} item(s) selected
                                </h5>
                                <Button variant='outline' text={checkoutProducts.length === voidProducts.length ? 'Unselect All' : 'Select All'} size='small' onClick={toggleAllVoidItems} />
                            </div>
                            <hr className='text-border'></hr>
                            <Button variant='main' text='Void Items' onClick={confirmVoidPayment} />
                        </div>
                        :
                        <div className={cn('mt-auto ml-auto w-full border-t border-l border-r py-6 px-8 border-border rounded-2xl flex flex-col gap-4',
                            { 'opacity-50 pointer-events-none': showVoid }
                        )}>
                            <div className='flex flex-col gap-2 '>
                                <div className='flex items-center justify-between'>
                                    <Label variant='small' text={`Items (${checkoutProducts.length})`} />
                                    <h5 className='text-text font-semibold text-sm'>₱ {Number(grossTotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                                </div>
                                <div className='flex items-center justify-between w-full gap-2'>
                                    <Button text={discount?.name || 'Select Discount'} variant='modalOutline' className='text-sm py-1' size='small' onClick={() => setShowDiscountModal(true)} />
                                    {discount.id !== -1 &&
                                        <h5 className='text-sm font-semibold text-success whitespace-nowrap'>
                                            -₱ {Number(discountBreakdown.totalDiscount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h5>
                                    }
                                </div>
                            </div>
                            <hr className='text-border'></hr>
                            <div className='flex items-center justify-between'>
                                <Label variant='small' text='Total' />
                                <h5 className='text-text font-semibold text-sm'>₱ {Number(netTotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                            </div>
                            <Button variant='main' text='Proceed' onClick={proceedToCheckout} />
                        </div>
                    }
                </div>
            </div>

            {/* Modals */}
            {/* TODO: */}
            {showPaymentModal &&
                <PaymentModal
                    totalPrice={netTotal}
                    customerName={customerName}
                    onCustomerNameChange={setCustomerName}
                    onConfirm={completePayment}
                    loading={paymentLoading}
                    onClose={() => setShowPaymentModal(false)}
                />
            }

            {showPaymentSuccessModal &&
                <PaymentSuccessModal totalAmount={completedTransaction?.net_total ?? netTotal} amountReceived={completedTransaction?.paid_amount ?? receivedPayment} onClose={handleTogglePaymentSuccessModal} businessData={businessData}
                    transactionData={completedTransaction}
                />
            }

            {showClearCheckoutModal &&
                <Modal onClose={() => setShowClearCheckoutModal(false)}>
                    <div className='flex flex-col justify-center items-center gap-4'>
                        <div className='bg-accent-mute/20 text-accent-mute p-4 rounded-full w-fit'>
                            <Lock size={36} />
                        </div>
                        <h5 className='font-bold text-xl'>Access Code Required</h5>
                        <h5 className='text-text/75 font-medium'>Enter the 4-digit access code to void items</h5>
                    </div>

                    <input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} type='password' maxLength={4} className='mx-auto bg-accent-mute/20 p-4 rounded-xl border-4 border-border font-medium text-lg tracking-widest text-center focus:outline-none focus:border-accent-mute' placeholder='ENTER CODE' />

                    {showModalFeedback &&
                        <ModalFeedbackCard type={modalFeedbackContent.type} label={modalFeedbackContent.label} details={modalFeedbackContent.details} />
                    }

                    <div className='flex items-center gap-4 ml-auto'>
                        <Button variant='modalOutline' size='modalSize' text='Cancel' onClick={() => setShowClearCheckoutModal(false)} />

                        {loadingAccessCode ?
                            <h5 disabled className='text-sm font-semibold text-accent-mute cursor-not-allowed'>
                                Verifying...
                            </h5>
                            :
                            <Button variant='modalBlock' size='modalSize' text='Verify' onClick={confirmAccessCode} />
                        }
                    </div>
                </Modal>
            }

            {prepProduct &&
                <VariantModal product={prepProduct} onClose={() => setPrepProduct(null)} onChoose={addToCheckout} />
            }

            {showDiscountModal &&
                <SelectDiscountModal discounts={discountData} cartItems={checkoutProducts} grossTotal={grossTotal} currentDiscountId={discount.id} onSelect={selectDiscount} onClose={() => setShowDiscountModal(false)} />
            }

            {showPendingOrdersModal &&
                <PendingOrdersModal
                    pendingTransactions={pendingTransactions}
                    completingOrderId={completingOrderId}
                    completingAll={completingAllOrders}
                    onClose={() => setShowPendingOrdersModal(false)}
                    onComplete={handleCompletePendingOrder}
                    onCompleteAll={handleCompleteAllPendingOrders}
                />
            }
        </div>
    )
}

export default Home