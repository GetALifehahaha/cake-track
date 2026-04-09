import React, { useEffect, useMemo, useState } from 'react';
import { Button, Dropdown } from '../../atoms';
import { Search, ShoppingBag, X } from 'lucide-react';
import useIngredient from '@/hooks/useIngredient';
import useOrder from '@/hooks/useOrders';
import useRecipe from '@/hooks/useRecipe';
import RecipeSelectionModal from '@/components/organisms/RecipeSelectionModal';
import AddRecipeModal from '@/components/organisms/recipe/AddRecipeModal';
import { useToast } from '@/context/ToastContext';
import { formatQty } from '@/utils/recipeUnits';
import { capitalizeSnakeCase } from '@/utils/capitalize';
import { parseTimeString } from '@/utils/time';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import API_ENDPOINTS from '@/api/endpoints';

const buildIngredientUnitOptions = (ingredient) => {
    const baseUnit = ingredient?.unit;
    const containerUnits = (ingredient?.containers || ingredient?.conversions || [])
        .map(container => ({
            unit: container.container_unit || container.from_unit,
            multiplierToBase: Number(container.container_amount || container.multiplier_to_base || 1),
        }))
        .filter(entry => entry.unit);

    const unique = new Map();

    if (baseUnit?.id) {
        unique.set(baseUnit.id, {
            value: String(baseUnit.id),
            label: baseUnit.abbreviation || baseUnit.name,
            multiplierToBase: 1,
        });
    }

    containerUnits.forEach(entry => {
        if (!unique.has(entry.unit.id)) {
            unique.set(entry.unit.id, {
                value: String(entry.unit.id),
                label: entry.unit.abbreviation || entry.unit.name,
                multiplierToBase: entry.multiplierToBase,
            });
        }
    });

    return Array.from(unique.values());
};

const mapRecipeToIngredientItems = (recipe) => {
    if (!recipe?.ingredients) return [];

    return recipe.ingredients.map(item => {
        const unitOptions = (item.ingredient_units || []).map(unit => ({
            value: String(unit.id),
            label: unit.abbreviation || unit.name,
            multiplierToBase: Number(unit.multiplier_to_base || 1),
        }));

        const defaultUnitId = item.ingredient_unit_id ? String(item.ingredient_unit_id) : unitOptions[0]?.value || null;
        const defaultLabel = unitOptions.find(option => String(option.value) === String(defaultUnitId))?.label || item.ingredient_unit;

        return {
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient_name,
            amount_needed: formatQty(item.amount_needed),
            ingredient_stock: item.ingredient_stock,
            ingredient_unit: item.ingredient_unit,
            is_missing: item.is_missing,
            unit_options: unitOptions,
            display_unit_id: defaultUnitId,
            display_unit_label: defaultLabel,
        };
    });
};

const formatReferenceNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return 'N/A';
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
};

const formatCurrency = (value) => `₱ ${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDeliveryDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const StepMarker = ({ number, label, active, done, onClick }) => {
    const variantClass = done
        ? 'bg-success text-main-white'
        : active
            ? 'bg-accent-text text-main-white'
            : 'bg-main text-text/60';

    return (
        <div className={`flex items-center gap-2 ${!active && !done ? 'opacity-60' : ''} cursor-pointer`} onClick={onClick}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${variantClass}`}>
                {number}
            </span>
            <span className={`text-sm font-medium ${active || done ? 'text-text' : 'text-text/60'}`}>{label}</span>
        </div>
    );
};

const OrderDetails = ({ orderDetails, onClose }) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const { ingredientAll, ingredientLoading } = useIngredient();
    const { data: recipeData, postRecipe, patchRecipe } = useRecipe();
    const { patchOrder, deductOrderIngredients } = useOrder();

    const [orderSnapshot, setOrderSnapshot] = useState(orderDetails);
    const [currentStep, setCurrentStep] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState('');
    const [savingRecipe, setSavingRecipe] = useState(false);
    const [showRecipeSelectionModal, setShowRecipeSelectionModal] = useState(false);
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [deducting, setDeducting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        setOrderSnapshot(orderDetails);
        setCurrentStep(1);
        const initialRecipe = orderDetails?.recipe_details;
        setSelectedIngredients(mapRecipeToIngredientItems(initialRecipe));
    }, [orderDetails]);

    const isAccepted = orderSnapshot?.status === 'accepted';
    const isRejected = orderSnapshot?.status === 'rejected';
    const isCancellationRequested = Boolean(orderSnapshot?.cancellation_requested);
    const hasSavedRecipe = Boolean(orderSnapshot?.recipe);
    const hasDeducted = Boolean(orderSnapshot?.ingredients_deducted_at);
    const isRecipeEditable = isAccepted && !hasDeducted;
    const payments = orderSnapshot?.payments || [];
    const latestPayment = payments.length ? payments[payments.length - 1] : null;
    const paymentStatus = latestPayment?.status || 'unpaid';
    const orderOccasion = orderSnapshot?.cake_orders?.occasion;
    const isPremadeOrder = String(orderOccasion || '').toLowerCase() === 'pre-made';
    const totalAmount = Number(orderSnapshot?.total_price || 0);
    const expectedDownpaymentAmount = isPremadeOrder
        ? totalAmount * 0.15
        : 500;
    const boundedExpectedDownpayment = totalAmount > 0
        ? Math.min(expectedDownpaymentAmount, totalAmount)
        : expectedDownpaymentAmount;
    const successfulPayments = payments.filter(payment => {
        const status = String(payment?.status || '').toLowerCase();
        return status === 'success' || status === 'completed' || status === 'paid';
    });
    const totalPaidAmount = successfulPayments.reduce((sum, payment) => sum + Number(payment?.amount || 0), 0);
    const recordedDownpayment = successfulPayments.find(payment => String(payment?.payment_type || '').toLowerCase() === 'downpayment');
    const paidDownpaymentAmount = recordedDownpayment
        ? Number(recordedDownpayment.amount || 0)
        : Math.min(totalPaidAmount, boundedExpectedDownpayment);
    const displayDownpaymentAmount = totalPaidAmount > 0 ? paidDownpaymentAmount : boundedExpectedDownpayment;
    const downpaymentAmountDisplay = formatCurrency(displayDownpaymentAmount);
    const showTotalAmountRow = isPremadeOrder || totalAmount > 0;
    const totalAmountDisplay = totalAmount > 0
        ? formatCurrency(totalAmount)
        : (isPremadeOrder ? 'N/A' : 'Available after order is completed');
    const referenceNumber = formatReferenceNumber(orderSnapshot?.reference_number || latestPayment?.reference_number);
    const refundReferenceNumber = formatReferenceNumber(orderSnapshot?.refund_reference_number);
    const showRefundReferenceRow = Boolean(orderSnapshot?.refund_reference_number);
    const formattedDeliveryDate = formatDeliveryDate(orderSnapshot?.due_date);
    const formattedDeliveryTime = orderSnapshot?.pickup_time ? parseTimeString(orderSnapshot.pickup_time) : 'N/A';

    const displayImages = useMemo(() => {
        let imgs = [];
        if (orderSnapshot?.order_images?.length > 0) {
            imgs = orderSnapshot.order_images.map(img => img.image_url).filter(Boolean);
        }
        if (imgs.length === 0 && orderSnapshot?.image) {
            imgs = [orderSnapshot.image];
        }
        return imgs.slice(0, 6);
    }, [orderSnapshot]);

    const filteredIngredients = useMemo(() => {
        const key = search.toLowerCase();
        return (ingredientAll || []).filter(ingredient => ingredient.name.toLowerCase().includes(key));
    }, [ingredientAll, search]);

    const availableRecipes = useMemo(() => recipeData?.results || [], [recipeData]);

    const loadRecipeById = (recipeId) => {
        const recipe = availableRecipes.find(item => String(item.id) === String(recipeId));
        if (!recipe) return;

        setSelectedIngredients(mapRecipeToIngredientItems(recipe));
    };

    const addIngredient = (ingredient) => {
        if (selectedIngredients.some(item => item.ingredient_id === ingredient.id)) return;

        const unitOptions = buildIngredientUnitOptions(ingredient);
        const defaultUnitId = ingredient?.unit?.id ? String(ingredient.unit.id) : unitOptions[0]?.value || null;
        const defaultUnitLabel = unitOptions.find(option => String(option.value) === String(defaultUnitId))?.label || ingredient?.unit?.abbreviation || 'Unit';

        setSelectedIngredients(prev => ([
            ...prev,
            {
                ingredient_id: ingredient.id,
                ingredient_name: ingredient.name,
                amount_needed: '',
                ingredient_stock: ingredient.total_stock,
                ingredient_unit: ingredient?.unit?.abbreviation,
                is_missing: false,
                unit_options: unitOptions,
                display_unit_id: defaultUnitId,
                display_unit_label: defaultUnitLabel,
            }
        ]));
    };

    const removeIngredient = (ingredientId) => {
        setSelectedIngredients(prev => prev.filter(item => item.ingredient_id !== ingredientId));
    };

    const updateAmount = (ingredientId, value) => {
        if (!/^\d*\.?\d{0,4}$/.test(value)) return;
        if (value.length > 11) return;

        setSelectedIngredients(prev => prev.map(item => (
            item.ingredient_id === ingredientId ? { ...item, amount_needed: value } : item
        )));
    };

    const updateIngredientUnit = (ingredientId, selectedUnitId) => {
        setSelectedIngredients(prev => prev.map(item => {
            if (item.ingredient_id !== ingredientId || (item.unit_options || []).length <= 1) return item;

            const currentOption = item.unit_options.find(option => option.value === item.display_unit_id);
            const nextOption = item.unit_options.find(option => option.value === selectedUnitId);

            if (!nextOption) return item;

            const numericAmount = Number(item.amount_needed || 0);
            const convertedAmount = item.amount_needed
                ? (numericAmount * Number(currentOption?.multiplierToBase || 1)) / Number(nextOption.multiplierToBase || 1)
                : '';

            return {
                ...item,
                display_unit_id: nextOption.value,
                display_unit_label: nextOption.label,
                amount_needed: convertedAmount === '' ? '' : formatQty(convertedAmount),
            };
        }));
    };

    const getAmountNeededInBaseUnit = (item) => {
        const selectedOption = (item.unit_options || []).find(option => String(option.value) === String(item.display_unit_id));
        const multiplierToBase = Number(selectedOption?.multiplierToBase || 1);
        return Number(item.amount_needed || 0) * multiplierToBase;
    };

    const validateIngredients = () => {
        if (selectedIngredients.length === 0) {
            addToast('Add at least one ingredient.', 'error');
            return false;
        }

        const invalid = selectedIngredients.some(item => !item.amount_needed || Number(item.amount_needed) <= 0);

        if (invalid) {
            addToast('Please enter valid ingredient amounts.', 'error');
            return false;
        }

        return true;
    };

    const saveOrderRecipe = async () => {
        if (!validateIngredients()) return;

        const payload = {
            name: `Temporary recipe - ${orderSnapshot.id}`,
            instructions: `Temporary recipe for order ${orderSnapshot.id}`,
            is_temporary: true,
            ingredients: selectedIngredients.map(item => ({
                ingredient_id: item.ingredient_id,
                amount_needed: Number(item.amount_needed),
                input_unit_id: Number(item.display_unit_id),
            })),
        };

        try {
            setSavingRecipe(true);

            let savedRecipe;

            if (orderSnapshot.recipe) {
                savedRecipe = await patchRecipe(orderSnapshot.recipe, payload);
            } else {
                savedRecipe = await postRecipe(payload);
                const patchedOrder = await patchOrder(orderSnapshot.id, { recipe: savedRecipe.id });
                setOrderSnapshot(patchedOrder);
            }

            setOrderSnapshot(prev => ({
                ...prev,
                recipe: savedRecipe.id,
                recipe_details: savedRecipe,
            }));

            setSelectedIngredients(mapRecipeToIngredientItems(savedRecipe));
            setCurrentStep(3);
            addToast('Order recipe saved.', 'success');
        } catch {
            addToast('Failed to save order recipe.', 'error');
        } finally {
            setSavingRecipe(false);
        }
    };

    const handleDeductIngredients = async () => {
        if (!orderSnapshot.recipe) {
            addToast('Save a recipe before deduction.', 'error');
            return;
        }

        try {
            setDeducting(true);
            await deductOrderIngredients(orderSnapshot.id);

            await queryClient.invalidateQueries({ queryKey: ['orders'] });

            const { data: refreshedOrder } = await api.get(`${API_ENDPOINTS.ORDERS}${orderSnapshot.id}/`);

            setOrderSnapshot(refreshedOrder);
            setSelectedIngredients(mapRecipeToIngredientItems(refreshedOrder?.recipe_details));

            addToast('Ingredients deducted successfully.', 'success');
        } catch (error) {
            const detail = error?.response?.data?.detail;
            addToast(detail || 'Failed to deduct ingredients.', 'error');
        } finally {
            setDeducting(false);
        }
    };

    const renderOrderInfo = () => (
        <div className='p-8 space-y-6 overflow-y-auto'>
            <div>
                <h3 className='text-lg font-bold text-text'>Order Summary</h3>
                <p className='text-text/60 text-sm'>Review order details before preparing ingredients.</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='border border-border rounded-2xl p-6 bg-main'>
                    <h4 className='text-[10px] uppercase tracking-widest text-text/60 font-bold mb-4'>Cake Details</h4>
                    <div className='space-y-3'>
                        <DetailRow label='Occasion' value={orderOccasion} />
                        <DetailRow label='Flavor' value={orderSnapshot?.cake_orders?.base_flavor} />
                        <DetailRow label='Filling' value={orderSnapshot?.cake_orders?.filling} />
                        <DetailRow label='Shape' value={orderSnapshot?.cake_orders?.shape} />
                        <DetailRow label='Inscription' value={capitalizeSnakeCase(orderSnapshot?.cake_orders?.message_type)} />
                        <DetailRow label='Message' value={orderSnapshot?.cake_orders?.message || 'N/A'} isLast />
                    </div>
                </div>

                <div className='border border-border rounded-2xl p-6 bg-main'>
                    <h4 className='text-[10px] uppercase tracking-widest text-text/60 font-bold mb-4'>Extras</h4>
                    <div className='space-y-3'>
                        <DetailRow label='Cupcakes' value={`${orderSnapshot?.cupcake_orders?.amount || 0}x`} />
                        <DetailRow label='Frosting' value={orderSnapshot?.cupcake_orders?.frosting || 'N/A'} />
                        <DetailRow label='Order ID' value={orderSnapshot?.id} />
                        <DetailRow label='Status' value={orderSnapshot?.status} isLast />
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='border border-border rounded-2xl p-6 bg-main'>
                    <h4 className='text-[10px] uppercase tracking-widest text-text/60 font-bold mb-4'>Reference Images</h4>
                    {displayImages.length > 0 ? (
                        <div className={`grid gap-3 ${displayImages.length === 1 ? 'grid-cols-1' : displayImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                            {displayImages.map((imgUrl, index) => (
                                <button key={index} type='button' onClick={() => setPreviewImage(imgUrl)} className='w-full'>
                                    <img
                                        src={imgUrl}
                                        alt={`Order reference ${index + 1}`}
                                        className={`w-full object-cover rounded-xl border border-border ${displayImages.length === 1 ? 'h-48' : 'h-24'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className='w-full h-48 rounded-xl border border-border bg-main-white flex items-center justify-center text-text/50 text-sm font-medium'>
                            No reference images
                        </div>
                    )}
                </div>

                <div className='border border-border rounded-2xl p-6 bg-main'>
                    <h4 className='text-[10px] uppercase tracking-widest text-text/60 font-bold mb-4'>Contact Information</h4>
                    <div className='space-y-3'>
                        <DetailRow label='Customer' value={orderSnapshot?.full_name || 'N/A'} />
                        <DetailRow label='Phone' value={orderSnapshot?.phone_number || 'N/A'} />
                        <DetailRow label='Email' value={orderSnapshot?.email || 'N/A'} />
                        <DetailRow label='Address' value={orderSnapshot?.address || 'N/A'} isLast />
                    </div>
                </div>
            </div>

            <div className='border border-border rounded-2xl p-6 bg-main'>
                <h4 className='text-[10px] uppercase tracking-widest text-text/60 font-bold mb-4'>Information</h4>
                <div className='rounded-xl border border-border bg-main-white p-4 mb-4'>
                    <p className='text-[10px] uppercase tracking-widest text-text/50 font-bold mb-2'>Comments</p>
                    <p className='text-sm text-text whitespace-pre-wrap wrap-break-word'>
                        {orderSnapshot?.comments?.trim() || 'No comments provided.'}
                    </p>
                </div>
                <div className='space-y-3'>
                    <DetailRow label='Pickup Date' value={formattedDeliveryDate} />
                    <DetailRow label='Pickup Time' value={formattedDeliveryTime} isLast />
                </div>
            </div>

            <div className='border border-border rounded-2xl p-6 bg-main'>
                <h4 className='text-[10px] uppercase tracking-widest text-text/60 font-bold mb-4'>Payment</h4>
                <div className='space-y-3'>
                    <DetailRow label='Payment' value={capitalizeSnakeCase(paymentStatus)} />
                    <DetailRow label='Reference Number' value={referenceNumber} />
                    {showRefundReferenceRow && (
                        <DetailRow label='Refund Reference Number' value={refundReferenceNumber} />
                    )}
                    <DetailRow label='Downpayment Amount' value={downpaymentAmountDisplay} isLast={!showTotalAmountRow} />
                    {showTotalAmountRow && (
                        <DetailRow label='Total Amount' value={totalAmountDisplay} isLast />
                    )}
                </div>
            </div>

            {isCancellationRequested && (
                <div className='mt-2 rounded-xl border border-error-border bg-error-fill p-4'>
                    <h4 className='text-xs font-bold uppercase tracking-widest text-error mb-1'>Cancellation Requested</h4>
                    <p className='text-sm text-error'>Customer requested cancellation and refund processing for this order.</p>
                </div>
            )}

            {isAccepted && (
                <div className='bg-accent/10 border border-accent/20 rounded-xl p-4'>
                    <p className='text-sm text-accent-dark'>
                        {hasDeducted
                            ? 'Ingredients have already been deducted. Recipe editing is now locked for this order.'
                            : 'Proceed to step 2 to set ingredients. You can load from an existing recipe or encode manually.'}
                    </p>
                </div>
            )}

            {isRejected && (
                <div className='mt-2 rounded-xl border border-error-border bg-error-fill p-4'>
                    <h4 className='text-xs font-bold uppercase tracking-widest text-error mb-1'>Reject Reason</h4>
                    <p className='text-sm text-error'>{orderSnapshot?.reject_reason || 'No reason provided.'}</p>
                </div>
            )}
        </div>
    );

    const renderIngredientsStep = () => (
        <div className='flex-1 overflow-hidden flex flex-col border-t border-border'>
            <div className='p-4 border-b border-border bg-main flex items-center gap-3'>

                <div className='ml-auto flex items-center gap-2'>
                    <h5 className='text-sm font-semibold '>Load exiting recipe</h5>
                    <div className='w-48'>
                        <Button
                            variant='modalOutline'
                            size='full'
                            text={selectedRecipeId ? recipeData?.results?.find(r => String(r.id) === String(selectedRecipeId))?.name || 'Select recipe' : 'Select recipe'}
                            onClick={() => {
                                if (hasDeducted) return;
                                setShowRecipeSelectionModal(true);
                            }}
                            className='justify-center truncate'
                        />
                    </div>
                </div>
            </div>

            <div className='flex flex-1 overflow-hidden bg-main/50'>
                <div className='basis-1/4 border-r border-border flex flex-col'>
                    <div className='px-4 py-3 border-b border-border'>
                        <h4 className='font-semibold text-sm text-text'>Available Ingredients</h4>
                    </div>
                    <div className='p-3'>
                        <div className='relative'>
                            <Search size={16} className='absolute left-3 top-2.5 text-text/50' />
                            <input
                                type='text'
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                disabled={hasDeducted}
                                placeholder='Search an ingredient...'
                                className='w-full pl-9 pr-3 py-2 text-sm bg-main-white border border-border rounded-lg focus:outline-none'
                            />
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto px-3 pb-3 space-y-2'>
                        {filteredIngredients.map(ingredient => (
                            <button
                                key={ingredient.id}
                                type='button'
                                onClick={() => !hasDeducted && addIngredient(ingredient)}
                                disabled={hasDeducted}
                                className='w-full text-left p-3 rounded-lg border border-border bg-main-white hover:border-accent transition-colors'
                            >
                                <h5 className='text-sm font-semibold text-text'>{ingredient.name}</h5>
                                <p className='text-[11px] text-text/60'>Stock: {formatQty(ingredient.total_stock)} {ingredient?.unit?.abbreviation}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className='flex-1 flex flex-col'>
                    <div className='px-4 py-3 border-b border-border bg-main-white'>
                        <h4 className='font-semibold text-sm text-text'>Transaction Items ({selectedIngredients.length})</h4>
                    </div>

                    <div className='flex-1 overflow-y-auto'>
                        {selectedIngredients.length === 0 ? (
                            <div className='h-full flex items-center justify-center text-text/50'>
                                <div className='text-center'>
                                    <ShoppingBag size={26} className='mx-auto mb-3 opacity-40' />
                                    <h5 className='text-sm font-semibold text-text/60'>No ingredients added yet</h5>
                                    <p className='text-xs mt-1'>Click an ingredient from the left panel, or load a recipe above.</p>
                                </div>
                            </div>
                        ) : (
                            <table className='w-full text-sm'>
                                <thead className='bg-main-white sticky top-0 z-10'>
                                    <tr className='text-left text-text/60 text-[11px] uppercase'>
                                        <th className='px-4 py-2'>Ingredient</th>
                                        <th className='px-4 py-2'>Amount</th>
                                        <th className='px-4 py-2'>Unit</th>
                                        <th className='px-4 py-2'>In Stock</th>
                                        <th className='px-4 py-2'>Status</th>
                                        <th className='px-4 py-2' />
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedIngredients.map(item => {
                                        const amountNeeded = getAmountNeededInBaseUnit(item);
                                        const stock = Number(item.ingredient_stock || 0);
                                        const isMissing = amountNeeded > 0 && stock < amountNeeded;

                                        return (
                                            <tr key={item.ingredient_id} className='border-t border-border'>
                                                <td className='px-4 py-2'>
                                                    <h5 className='font-semibold text-text'>{item.ingredient_name}</h5>
                                                    <p className='text-[11px] text-text/60'>Stock: {formatQty(item.ingredient_stock)} {item.ingredient_unit}</p>
                                                </td>
                                                <td className='px-4 py-2'>
                                                    <input
                                                        type='text'
                                                        value={item.amount_needed}
                                                        onChange={(event) => updateAmount(item.ingredient_id, event.target.value)}
                                                        disabled={hasDeducted}
                                                        className='w-16 px-2 py-1 border border-border rounded bg-main-white focus:outline-none'
                                                    />
                                                </td>
                                                <td className='px-4 py-2'>
                                                    <div className='w-24'>
                                                        {hasDeducted ? (
                                                            <div className='px-2 py-1 border border-border rounded bg-main text-xs text-text/70'>
                                                                {item.display_unit_label || 'Unit'}
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                size='full'
                                                                variant='modal'
                                                                value={item.display_unit_id}
                                                                selection={item.display_unit_label || 'Unit'}
                                                                options={(item.unit_options || []).map(option => ({ key: option.label, value: option.value }))}
                                                                onSelect={(value) => updateIngredientUnit(item.ingredient_id, value)}
                                                                allowNone={false}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className='px-4 py-2 text-text/70'>{formatQty(item.ingredient_stock)} {item.ingredient_unit}</td>
                                                <td className='px-4 py-2'>
                                                    <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${isMissing ? 'bg-error-fill text-error' : 'bg-success-fill text-success'}`}>
                                                        {isMissing ? 'Low' : 'OK'}
                                                    </span>
                                                </td>
                                                <td className='px-4 py-2'>
                                                    <button onClick={() => !hasDeducted && removeIngredient(item.ingredient_id)} disabled={hasDeducted} className='text-text/60 hover:text-error disabled:opacity-40 disabled:cursor-not-allowed'>
                                                        <X size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReviewStep = () => (
        <div className='p-6 overflow-y-auto flex-1 border-t border-border'>
            <div className='mb-4 flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-bold text-text'>Review Ingredients</h3>
                    <p className='text-sm text-text/60'>Saved temporary recipe for this order.</p>
                </div>
                <button
                    onClick={() => !hasDeducted && setCurrentStep(2)}
                    disabled={hasDeducted}
                    className='px-4 py-2 rounded-lg border border-border text-sm font-semibold bg-main-white hover:bg-main disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    Edit Recipe
                </button>
            </div>

            <div className='border border-border rounded-xl overflow-hidden'>
                <table className='w-full text-sm'>
                    <thead className='bg-main text-text/70 text-[11px] uppercase'>
                        <tr>
                            <th className='px-4 py-2 text-left'>Ingredient</th>
                            <th className='px-4 py-2 text-left'>Amount</th>
                            <th className='px-4 py-2 text-left'>In Stock</th>
                            <th className='px-4 py-2 text-left'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedIngredients.map(item => {
                            const missing = getAmountNeededInBaseUnit(item) > Number(item.ingredient_stock || 0);
                            return (
                                <tr key={item.ingredient_id} className='border-t border-border'>
                                    <td className='px-4 py-2 font-semibold text-text'>{item.ingredient_name}</td>
                                    <td className='px-4 py-2 text-text/80'>{formatQty(item.amount_needed)} {item.display_unit_label}</td>
                                    <td className='px-4 py-2 text-text/70'>{formatQty(item.ingredient_stock)} {item.ingredient_unit}</td>
                                    <td className='px-4 py-2'>
                                        <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${missing ? 'bg-error-fill text-error' : 'bg-success-fill text-success'}`}>
                                            {missing ? 'Insufficient' : 'OK'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {selectedIngredients.length === 0 && (
                            <tr>
                                <td className='px-4 py-6 text-text/50 text-center' colSpan={4}>No ingredients saved yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className='mt-4 text-xs text-text/60'>
                {hasDeducted ? 'Ingredients already deducted for this order.' : 'Deduct all ingredients once recipe review is complete.'}
            </div>
        </div>
    );

    return (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
            <div className='bg-main-white rounded-3xl shadow-xl w-full max-w-[90vw] h-[90vh] overflow-hidden flex flex-col'>
                <div className='p-5 flex justify-between items-center border-b border-border'>
                    <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-3'>
                            <span className='bg-accent/20 text-accent-dark px-3 py-1 rounded-full text-xs font-bold uppercase'>
                                {orderSnapshot?.id}
                            </span>
                            <span className='capitalize text-text/50 text-sm font-medium'>{orderSnapshot?.status}</span>
                        </div>
                        <h2 className='text-lg ml-2 font-bold text-text'>Deduct Inventory Ingredients</h2>
                    </div>

                    {isAccepted && (
                        <div className='flex items-center gap-4'>
                            <StepMarker number={1} label='Order Info' onClick={() => setCurrentStep(1)} active={currentStep === 1} done={currentStep > 1} />
                            <div className='h-px w-8 bg-border' />
                            <StepMarker number={2} label='Ingredients' onClick={() => !hasDeducted && setCurrentStep(2)} active={currentStep === 2} done={currentStep > 2} />
                            <div className='h-px w-8 bg-border' />
                            <StepMarker number={3} label='Review' onClick={() => setCurrentStep(3)} active={currentStep === 3} done={false} />
                        </div>
                    )}

                    <button onClick={onClose} className='p-2 hover:bg-main rounded-full transition-colors'>
                        <X size={20} className='text-text/60' />
                    </button>
                </div>

                {currentStep === 1 && renderOrderInfo()}
                {isRecipeEditable && currentStep === 2 && renderIngredientsStep()}
                {isAccepted && currentStep === 3 && renderReviewStep()}

                {isAccepted && (
                    <div className='p-4 bg-main-white border-t border-border flex items-center justify-end gap-2'>
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep(prev => (hasDeducted ? 1 : Math.max(1, prev - 1)))}
                                className='px-5 py-2 rounded-lg border border-border text-sm font-semibold bg-main-white hover:bg-main'
                            >
                                ← Back
                            </button>
                        )}

                        {currentStep === 1 && !hasDeducted && (
                            <button
                                onClick={() => setCurrentStep(2)}
                                className='px-6 py-2.5 rounded-lg bg-accent-text text-main-white text-sm font-semibold hover:opacity-90'
                            >
                                Next Step
                            </button>
                        )}

                        {currentStep === 1 && hasDeducted && (
                            <button
                                onClick={() => setCurrentStep(3)}
                                className='px-6 py-2.5 rounded-lg bg-accent-text text-main-white text-sm font-semibold hover:opacity-90'
                            >
                                View Review
                            </button>
                        )}

                        {currentStep === 2 && !hasDeducted && (
                            <button
                                onClick={saveOrderRecipe}
                                disabled={savingRecipe || ingredientLoading}
                                className='px-6 py-2.5 rounded-lg bg-accent-text text-main-white text-sm font-semibold disabled:opacity-50 hover:opacity-90'
                            >
                                {savingRecipe ? 'Saving...' : hasSavedRecipe ? 'Update Recipe' : 'Save Recipe'}
                            </button>
                        )}

                        {currentStep === 3 && (
                            <button
                                onClick={handleDeductIngredients}
                                disabled={hasDeducted || deducting || !hasSavedRecipe}
                                className='px-6 py-2.5 rounded-lg bg-text text-main-white text-sm font-semibold disabled:opacity-50 hover:opacity-90'
                            >
                                {hasDeducted ? 'Ingredients Deducted' : deducting ? 'Deducting...' : 'Deduct All Ingredients'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {previewImage && (
                <div className='fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4' onClick={() => setPreviewImage(null)}>
                    <div className='relative max-w-[95vw] max-h-[95vh]' onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} className='absolute -top-3 -right-3 p-2 rounded-full bg-main-white/90 hover:bg-main-white'>
                            <X size={18} className='text-text/80' />
                        </button>
                        <img src={previewImage} alt='Reference preview' className='max-w-[95vw] max-h-[95vh] object-contain rounded-xl border border-main-white/30 shadow-xl' />
                    </div>
                </div>
            )}

            {showRecipeSelectionModal && (
                <RecipeSelectionModal
                    options={recipeData?.results ? recipeData.results.map(r => ({ key: r.name, value: r.id })) : []}
                    selectedValue={selectedRecipeId}
                    onConfirm={(val) => {
                        if (val === null) {
                            setSelectedRecipeId('');
                            setSelectedIngredients([]);
                        } else {
                            setSelectedRecipeId(String(val));
                            loadRecipeById(val);
                        }
                        setShowRecipeSelectionModal(false);
                    }}
                    onClose={() => setShowRecipeSelectionModal(false)}
                    onAddNewRecipe={() => setShowAddRecipeModal(true)}
                />
            )}

            {showAddRecipeModal && (
                <AddRecipeModal
                    onClose={() => setShowAddRecipeModal(false)}
                    onConfirm={async (payload) => {
                        const created = await postRecipe(payload);
                        setSelectedRecipeId(String(created.id));
                        loadRecipeById(created.id);
                        setShowAddRecipeModal(false);
                        setShowRecipeSelectionModal(false);
                    }}
                />
            )}

        </div>
    );
};

const DetailRow = ({ label, value, isLast }) => (
    <div className={`flex justify-between items-center pb-2 ${!isLast ? 'border-b border-border' : ''}`}>
        <span className='text-sm text-text/60 font-medium'>{label}</span>
        <span className='text-sm font-semibold capitalize text-text wrap-break-words whitespace-normal w-72 text-right'>{value || 'N/A'}</span>
    </div>
);

export default OrderDetails;