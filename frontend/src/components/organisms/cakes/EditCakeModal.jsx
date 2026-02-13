import React, { useState } from 'react';
import { Button, Label, Title } from '@/components/atoms';
import { X, Upload, Loader2 } from 'lucide-react';
import { ModalFeedbackCard } from '@/components/molecules';
import { ConfirmationModal } from '../';
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
} from "@/api/constants";

const EditCakeModal = ({ cake, onConfirm, onClose }) => {

    const [cakeName, setCakeName] = useState(cake.name);
    const [price, setPrice] = useState(cake.price);
    const [image, setImage] = useState(cake.image);
    const [imagePreview, setImagePreview] = useState(cake.image);
    const [imageChanged, setImageChanged] = useState(false);

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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
        setImageChanged(true);

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        setImageChanged(true);
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

    const handleConfirmModal = async () => {
        setShowConfirmationModal(false);

        if (!cakeName || !price) {
            setFeedback({
                label: 'Incomplete details',
                details: 'Please fill in all required fields.',
                type: 'error'
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: cakeName,
                price: Number(price),
                image: imageChanged
                    ? image
                        ? await uploadToCloudinary(image)
                        : null
                    : image,
            };

            await onConfirm(payload);
        } catch (err) {
            setFeedback({
                label: 'Error',
                details: 'Something went wrong while updating the cake.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>

                <div className="flex justify-between items-center w-full">
                    <Title variant='modal' text='Edit Cake' />
                    <X size={16} className='text-text cursor-pointer' onClick={onClose} />
                </div>

                <div className='flex gap-8'>

                    {/* Image */}
                    <div className='flex flex-col gap-2'>
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
                                onChange={(e) => setCakeName(e.target.value)}
                            />
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Price' />
                            <input
                                type='number'
                                className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full'
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
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
                                text='Save'
                                onClick={() => setShowConfirmationModal(true)}
                            />
                        </>
                    )}
                </div>

                {showConfirmationModal &&
                    <ConfirmationModal
                        title="Save Changes?"
                        content="Are you sure you want to update this cake?"
                        onReject={() => setShowConfirmationModal(false)}
                        onConfirm={handleConfirmModal}
                    />
                }

            </div>
        </div>
    );
};

export default EditCakeModal;
