import React, { useState } from 'react';
import { Button, Label } from '@/components/atoms';
import { X, Upload, Loader2 } from 'lucide-react';
import { ModalBody, ModalFeedbackCard } from '@/components/molecules';
import { ConfirmationModal } from '../';
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
} from "@/api/constants";
import useRecipe from '@/hooks/useRecipe';
import AddRecipeModal from '@/components/organisms/recipe/AddRecipeModal';
import RecipeSelectionModal from '@/components/organisms/RecipeSelectionModal';
import { Dropdown } from '@/components/atoms';
import { limitedInput } from '@/utils/safeInput';

const AddCakeModal = ({ onConfirm, onClose }) => {
    const { data: recipeData, postRecipe } = useRecipe();

    const [cakeName, setCakeName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [showRecipeSelectionModal, setShowRecipeSelectionModal] = useState(false);
    const [recipeId, setRecipeId] = useState('');

    const handleCakeName = (e) => {
        const value = limitedInput(e, { maxLength: 50 });
        if (value === undefined) return;
        setCakeName(value);
    }

    const handlePrice = (e) => {
        e.preventDefault();

        const raw = e.target.value

        if (!/^\d*\.?\d{0,2}$/.test(raw)) return

        if (e.target.value.length > 13) return

        setPrice(e.target.value);
    }

    const validateFields = () => {
        if (!cakeName || !price || !image || !recipeId) {
            setFeedback({
                label: 'Incomplete details',
                details: 'Please fill in all required fields including recipe.',
                type: 'error'
            });
            return false;
        }

        return true
    }

    const handleConfirmationModal = () => {
        if (!validateFields()) {
            return;
        }

        setShowConfirmationModal(true)
    }


    const addCake = async () => {
        try {
            setLoading(true);

            const payload = {
                name: cakeName,
                price: Number(price),
                image: image ? await uploadToCloudinary(image) : null,
                recipe: Number(recipeId),
            };

            await onConfirm(payload);
        } catch {
            setFeedback({
                label: 'Error',
                details: 'Something went wrong while adding the cake.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFeedback({
                label: 'Invalid file',
                details: 'Please upload a valid image file.',
                type: 'error'
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFeedback({
                label: 'File too large',
                details: 'Image must be less than 5MB.',
                type: 'error'
            });
            return;
        }

        setImage(file);

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const uploadToCloudinary = async (imageFile) => {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Image upload failed");
        }

        const data = await response.json();
        return data.secure_url;
    };

    const handleCreateRecipe = async (payload) => {
        const created = await postRecipe(payload);
        setRecipeId(String(created.id));
        setShowAddRecipeModal(false);
    }

    const recipeOptions = (recipeData?.results || []).map(recipe => ({ key: recipe.name, value: recipe.id }));

    return (
        <ModalBody
            title="Add New Cake"
            subtitle="Create a new cake item"
            onClose={onClose}
        >
            <div className='flex gap-8'>

                {/* Image Upload */}
                <div className='flex flex-col gap-2 relative'>
                    <div className='flex justify-between items-center w-full mb-2'>
                        <Label variant='modal' text='Cake Image' />
                        {imagePreview &&
                            <Button variant='icon' text='' icon={X} onClick={handleRemoveImage} />
                        }
                    </div>

                    <label className='h-60 flex flex-col items-center justify-center gap-2 rounded-xl border-border border aspect-square cursor-pointer'>
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                className='object-cover h-full w-full rounded-xl'
                                alt="preview"
                            />
                        ) : (
                            <>
                                <Upload size={48} className='text-text/50' />
                                <h5 className='text-text/50 font-semibold text-sm'>
                                    Click to upload
                                </h5>
                                <h5 className='text-text/50 font-semibold text-sm'>
                                    PNG, JPG
                                </h5>
                            </>
                        )}

                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>

                {/* Details */}
                <div className='flex flex-col gap-6 w-120'>

                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Cake Name' />
                        <input
                            type='text'
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                            value={cakeName}
                            placeholder='e.g., Chocolate Fudge'
                            onChange={(e) => handleCakeName(e)}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Price' />
                        <input
                            type='text'
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                            value={price}
                            placeholder='e.g., 850'
                            onChange={(e) => handlePrice(e)}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Recipe' />
                        <div className='flex items-center gap-2'>
                            <div className='flex-1'>
                                <Button
                                    variant='modalOutline'
                                    size='small'
                                    text={recipeId ? recipeData?.results?.find(r => r.id === Number(recipeId))?.name || 'Select recipe' : 'Select recipe'}
                                    onClick={() => setShowRecipeSelectionModal(true)}
                                    className='justify-center'
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {feedback &&
                <ModalFeedbackCard
                    label={feedback.label}
                    details={feedback.details}
                    type={feedback.type}
                />
            }

            <div className='flex gap-4 ml-auto'>
                {loading ? (
                    <div className='flex items-center gap-2'>
                        <Loader2 size={18} className='animate-spin text-accent' />
                        <h5 className='text-accent-mute font-medium text-md'>
                            Loading
                        </h5>
                    </div>
                ) : (
                    <>
                        <Button
                            variant='modalOutline'
                            size='base'
                            text='Cancel'
                            onClick={onClose}
                        />
                        <Button
                            variant='modalBlock'
                            size='base'
                            text='Add Cake'
                            onClick={handleConfirmationModal}
                        />
                    </>
                )}
            </div>

            {showConfirmationModal &&
                <ConfirmationModal
                    title="Add Cake?"
                    content="Are you sure you want to add this cake?"
                    onReject={() => setShowConfirmationModal(false)}
                    onConfirm={addCake}
                />
            }

            {showRecipeSelectionModal && (
                <RecipeSelectionModal
                    options={recipeOptions}
                    selectedValue={recipeId}
                    onConfirm={(val) => {
                        setRecipeId(String(val));
                        setShowRecipeSelectionModal(false);
                    }}
                    onClose={() => setShowRecipeSelectionModal(false)}
                    onAddNewRecipe={() => setShowAddRecipeModal(true)}
                />
            )}

            {showAddRecipeModal &&
                <AddRecipeModal
                    onClose={() => setShowAddRecipeModal(false)}
                    onConfirm={handleCreateRecipe}
                />
            }
        </ModalBody>
    );
};

export default AddCakeModal;
