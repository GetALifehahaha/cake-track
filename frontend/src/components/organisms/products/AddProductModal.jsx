import React, {useState} from 'react';
import { Button, Dropdown, Label } from '../../atoms';
import { X, Plus, Upload, Loader2, Minus, Check } from 'lucide-react'
import { ModalBody, ModalFeedbackCard } from '../../molecules';
import { ConfirmationModal } from '..';
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
} from "@/api/constants";
import { cn } from '@/utils/cn';
import useCategory from '@/hooks/useCategory';
import useRecipe from '@/hooks/useRecipe';
import AddRecipeModal from '@/components/organisms/recipe/AddRecipeModal';

const AddProductModal = ({categoryOptions: initialCategoryOptions, onConfirm, onClose}) => {

    const { postCategory, refresh: refreshCategories } = useCategory();
    const { data: recipeData, postRecipe } = useRecipe();

    const [productName, setProductName] = useState("");
    const [categories, setCategories] = useState([{ id: "" }]);
    const [categoryOptions, setCategoryOptions] = useState(initialCategoryOptions);
    const [creatingCategoryIndex, setCreatingCategoryIndex] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [variants, setVariants] = useState([
        {label: "", price: 0, recipe: ''}
    ])
    
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(false);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [recipeTargetIndex, setRecipeTargetIndex] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);

    const [feedback, setFeedback] = useState(null);

    const clearFeedback = () => setFeedback(null)

    const handleConfirmModal = async () => {
        setShowConfirmationModal(false);
        setLoading(true);
        clearFeedback();
        const payload ={
            name: productName,
            image: image ? await uploadToCloudinary(image) : null,
            category_ids: [...categories.filter(Boolean).map(category => category.id)],
            variants: variants
                .filter(({ label, price }) => label.trim() && Number(price) > 0)
                .map(({ label, price, recipe }) => ({
                    label,
                    price,
                    recipe: recipe ? Number(recipe) : null,
                })),
        }
        onConfirm(payload);
        setLoading(false);
    }

    const handleCreateRecipe = async (payload) => {
        const created = await postRecipe(payload);
        if (recipeTargetIndex !== null) {
            setVariants(prev => prev.map((variant, index) => (
                index === recipeTargetIndex ? { ...variant, recipe: String(created.id) } : variant
            )));
        }
        setShowAddRecipeModal(false);
        setRecipeTargetIndex(null);
    }

    const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith("image/")) {
                    setFeedback({
                        label: 'Invalid file',
                        details: 'Please upload a valid image file.',
                        type: 'error',
                    });
                    return;
                }
    
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    setFeedback({
                        label: 'File too large',
                        details: 'Image size should be less than 5MB.',
                        type: 'error',
                    });
                    return;
                }
    
                setImage(file);
    
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        };
    
    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const validateFields = () => {
        const hasValidCategory = categories.some(c => c.id && c.id !== "");

        
        const hasValidVariant = variants.some(
            v => v.label !== "" && Number(v.price) > 0
        );


        if (!productName.trim() || !hasValidCategory || !hasValidVariant) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            });

            return false;
        }

        return true;
    }

    const uploadToCloudinary = async (imageFile) => {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to upload image");
            }

            const data = await response.json();
            return data.secure_url; // Returns the Cloudinary URL
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw error;
        }
    };
    

    const handleSetProductName = (e) => {
        e.preventDefault();

        if (e.target.value.length > 51) return

        setProductName(e.target.value);
    }

    const handleCategories = (value, index) => {
        if (categories.some(c => c.id === value)) return;

        setCategories(prev =>
            prev.map((cat, idx) =>
                idx === index ? { id: value } : cat
            )
        );
    };

    const handleCategoryCount = (method, index = null) => {
        setCategories(prev => {
            if (method === "minus" && index !== null) {
                return prev.filter((_, idx) => idx !== index);
            }

            return prev;
        });
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const result = await postCategory({ name: newCategoryName });
            await refreshCategories();
            const newId = result?.data?.id || result?.id;
            if (newId) {
                setCategoryOptions(prev => [...prev, { key: newCategoryName, value: newId }]);
                setCategories(prev => {
                    const updated = [...prev];
                    updated[creatingCategoryIndex] = { id: newId };
                    return updated;
                });
            }
            setNewCategoryName("");
            setCreatingCategoryIndex(null);
        } catch (err) {
            console.error("Failed to create category", err);
        }
    };

    const updatePrice = (index, e) => {
        e.preventDefault();

        const raw = e.target.value

        if (!/^\d*\.?\d{0,2}$/.test(raw)) return

        if (e.target.value.length > 7) return;

        setVariants(prev => prev.map((item, itemIndex) => itemIndex === index ? {...item, price: e.target.value} : item));
    }

    const updateLabel = (index, e) => {
        e.preventDefault();

        if (e.target.value.length > 11) return

        setVariants(prev => prev.map((item, itemIndex) => itemIndex === index ? {...item, label: e.target.value} : item));
    }

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((item, itemIndex) => itemIndex !== index))
    }

    const handleSetShowConfirmationModal = () => {
        if (!validateFields()) return

        setShowConfirmationModal(!showConfirmationModal);
    }

    const recipeOptions = [
        { key: 'Create New Recipe', value: '__create_recipe__' },
        ...(recipeData?.results || []).map(recipe => ({ key: recipe.name, value: recipe.id })),
    ];

    const handleRecipeSelect = (value, index) => {
        if (!value) {
            setVariants(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, recipe: '' } : item));
            return;
        }

        if (value === '__create_recipe__') {
            setRecipeTargetIndex(index);
            setShowAddRecipeModal(true);
            return;
        }

        setVariants(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, recipe: String(value) } : item));
    };

    return (
        <ModalBody title='Add New Item' onClose={onClose} subtitle='Create a new product by filling in the details below' className='min-w-[34vw] max-w-[94vw]'>
                <div className='grid grid-cols-[15rem_1fr] gap-8'>
                    <div className='flex flex-col gap-2 relative'>
                        <div className='flex justify-between items-center w-full mb-2'>
                            <Label variant='modal' text='Product Image' />
                            {imagePreview && 
                            <Button variant='icon' text='' icon={X} onClick={handleRemoveImage}/>
                            }
                        </div>
                        <label className='h-60 flex flex-col items-center justify-center gap-2 rounded-xl border-border border aspect-square'>
                            {(imagePreview) ? 
                            <img src={imagePreview} className='object-cover h-full w-full rounded-xl'/>
                            :
                            <>
                                <Upload size={48} className='text-text/50'/>
                                <h5 className='text-text/50 font-semibold text-sm'>Click to upload</h5>
                                <h5 className='text-text/50 font-semibold text-sm'>PNG, JPG</h5>
                            </>
                            }

                            <input
                                id="file-upload"
                                type="file"
                                accept="image/png, image/jpeg"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                        
                    </div>

                    <div className='grid gap-8 w-136'>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Product Name' />
                            <input type='text' className='h-10 px-3 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={productName} max={50} placeholder='e.g., Matcha in the Morning' onChange={(e) => handleSetProductName(e)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Categories' />
                                <div className='flex flex-col gap-2 max-h-40 overflow-auto'>
                                    {categories.map(({ id }, index) => (
                                        <div key={index} className='flex gap-2 items-center'>
                                            {creatingCategoryIndex === index ? (
                                                <>
                                                    <input
                                                        type='text'
                                                        value={newCategoryName}
                                                        onChange={(e) => { if (e.target.value.length <= 50) setNewCategoryName(e.target.value) }}
                                                        placeholder='New category name'
                                                        className='h-10 px-3 rounded-sm bg-main-dark/50 focus:outline-none flex-1'
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                                                    />
                                                    <Button variant='icon' text='' icon={Check} onClick={handleCreateCategory} />
                                                    <Button variant='icon' text='' icon={X} onClick={() => { setCreatingCategoryIndex(null); setNewCategoryName(""); }} />
                                                </>
                                            ) : (
                                                <>
                                                    <Dropdown
                                                        variant='modal'
                                                        value={id}
                                                        selection="Select category"
                                                        size='full'
                                                        options={categoryOptions}
                                                        onSelect={(value) => handleCategories(value, index)}
                                                        removeText='None'
                                                    />

                                                    {index === categories.length - 1 ? (
                                                        <Button
                                                            variant='icon'
                                                            text=''
                                                            icon={Plus}
                                                            onClick={() => setCreatingCategoryIndex(index)}
                                                        />
                                                    ) : categories.length > 1 && (
                                                        <Button
                                                            variant='icon'
                                                            text=''
                                                            icon={Minus}
                                                            onClick={() => handleCategoryCount("minus", index)}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Variants' />
                            <div className="grid gap-2 w-full max-h-40 overflow-auto">
                                <div className='grid grid-cols-[1fr_7rem_minmax(0,1fr)_2.5rem] items-center gap-2'>
                                    <h5 className='text-xs font-medium'>Label</h5>
                                    <h5 className='text-xs font-medium'>Price</h5>
                                    <h5 className='text-xs font-medium'>Recipe (optional)</h5>
                                </div>  
                                {variants.map(({label, price, recipe}, index) => (
                                    <div className='grid grid-cols-[1fr_7rem_minmax(0,1fr)_2.5rem] items-center gap-2'>
                                        <input
                                            type="text"
                                            value={label}
                                            placeholder='Label'
                                            onChange={(e) => updateLabel(index, e)}
                                            className='h-10 px-3 rounded w-full bg-main-dark/50'
                                        />
                                        <input
                                            type="text"
                                            value={price}
                                            onChange={(e) => updatePrice(index, e)}
                                            className='h-10 px-3 rounded w-full bg-main-dark/50'
                                        />
                                        <Dropdown
                                            variant='modal'
                                            value={recipe}
                                            selection='Select recipe'
                                            size='full'
                                            options={recipeOptions}
                                            onSelect={(value) => handleRecipeSelect(value, index)}
                                        />
                                        {index === variants.length-1 ?
                                            <Button text='' icon={Plus} variant='icon' className='ml-auto' onClick={() => setVariants(prev => [...prev, {label: "", price: 0, recipe: ''}])} />
                                            :
                                            <Button text='' icon={Minus} variant='icon' onClick={() => removeVariant(index)} />
                                        }
                                    </div>
                                ))
                            }
                            </div>  
                        </div>
                    </div>
                </div>

                {feedback &&
                    <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type} />
                }
                <div className='flex gap-4 ml-auto'>
                    {creatingCategoryIndex !== null ? (
                        <span className='text-text/50 text-sm italic'>Complete category creation or press X to cancel</span>
                    ) : loading ? (
                        <div className='flex flex-row items-center gap-2'>
                            <Loader2 size={18} className='animate-spin text-accent' />
                            <h5 className='text-accent-mute font-medium text-md'>Loading</h5>
                        </div>
                    ) : (
                        <>
                            <Button variant='modalOutline' size='base' text='Cancel' onClick={onClose} />
                            <Button variant='modalBlock' size='base' text='Add Item' onClick={handleSetShowConfirmationModal} />
                        </>
                    )}
                </div>

                {showConfirmationModal &&
                    <ConfirmationModal title="Add Product?" content="Are you sure you want to add this product?" onReject={handleSetShowConfirmationModal} onConfirm={handleConfirmModal} />
                }

                {showAddRecipeModal &&
                    <AddRecipeModal onClose={() => setShowAddRecipeModal(false)} onConfirm={handleCreateRecipe} />
                }
            {/* Sizes and Prices */}
        </ModalBody>
    )
}

export default AddProductModal;