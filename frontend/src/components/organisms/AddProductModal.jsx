import React, {useState} from 'react';
import { Button, Dropdown, Label, Title } from '../atoms';
import { X, Plus, Upload, Loader2 } from 'lucide-react'
import { ModalFeedbackCard } from '../molecules';
import { ConfirmationModal } from '.';
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
} from "@/api/constants";
import { cn } from '@/utils/cn';

const AddProductModal = ({categoryOptions, onConfirm, onClose}) => {

    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [sizes, setSizes] = useState([
        {size: 'XS', active: false, price: ''},
        {size: 'S', active: false, price: ''},
        {size: 'M', active: false, price: ''},
        {size: 'L', active: false, price: ''},
        {size: 'XL', active: false, price: ''},
    ]);
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(false);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const [imagePreview, setImagePreview] = useState(null);

    const [feedback, setFeedback] = useState("");

    const handleConfirmModal = async () => {
        setShowConfirmationModal(false);
        setLoading(true);
        // if (!productName || !category || !price || !imagePreview) {
        if (!productName || !category) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return

        };
        const payload ={
            name: productName,
            image: image ? await uploadToCloudinary(image) : null,
            category_id: category,
            sizes: sizes.filter(item => item.active).map(item => ({size: item.size, price:item.price}))
        }
        console.log(payload)
        onConfirm(payload);
        setLoading(false);
    }

    const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith("image/")) {
                    setErrorMessages((prev) => [
                        ...prev,
                        "Please upload a valid image file",
                    ]);
                    return;
                }
    
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    setErrorMessages((prev) => [
                        ...prev,
                        "Image size should be less than 5MB",
                    ]);
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

        setProductName(e.target.value);
    }
    const handleSetCategory = (value) => {

        setCategory(value);
    }

    const toggleSize = (size) => {
        setSizes(prev => prev.map(item => item.size === size ? {...item, active: !item.active} : item));
    }

    const updatePrice = (size, value) => {
        setSizes(prev => prev.map(item => item.size === size ? {...item, price: value} : item));
    }

    const handleSetShowConfirmationModal = () => {
        setShowConfirmationModal(!showConfirmationModal);
    }

    return (
        <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10 gap-4'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex flex-col gap-2'>
                    <div className="flex justify-between items-center w-full">
                        <Title variant='modal' text='Add New Item' />
                        <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                    </div>
                    <Label variant='small' text='Create a new product by filling in the details below' />
                </div>

                <div className='flex gap-8'>
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

                    <div className='flex flex-col gap-8 w-120'>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Product Name' />
                            <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={productName} placeholder='e.g., Matcha in the Morning' onChange={(e) => handleSetProductName(e)}/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Category' />
                            <div className='flex gap-2'>
                                <Dropdown variant='modal' value={category} selection="e.g., Drinks" size='full' options={categoryOptions} onSelect={handleSetCategory} />
                                <Button variant='icon' text='' icon={Plus}/>
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label variant='modal' text='Sizes' />
                            {/* <input 
                            type='number' 
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={price} placeholder='P 0.00' onChange={(e) => handleSetPrice(e)}/> */}
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {sizes.map(item => (
                                    <div key={item.size} className="flex items-center gap-2">
                                        
                                        <button
                                            type="button"
                                            onClick={() => toggleSize(item.size)}
                                            className={cn(
                                                "aspect-square w-12 rounded border-2 border-border hover:border-text/50 text-text font-bold cursor-pointer",
                                                !item.active && 'opacity-50'
                                            )}
                                        >
                                            {item.size}
                                        </button>

                                        {/* INPUT */}
                                        <input
                                            type="number"
                                            value={item.price}
                                            disabled={!item.active}
                                            onChange={(e) => updatePrice(item.size, e.target.value)}
                                            className={cn(
                                                "p-2 rounded w-full bg-main-dark/50",
                                                !item.active && "opacity-50 pointer-events-none"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>  
                        </div>
                    </div>
                </div>

                {feedback &&
                    <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type} />
                }
                <div className='flex gap-4 ml-auto'>
                    {loading ?
                        <div className='flex flex-row items-center gap-2'>
                            <Loader2 size={18} className='animate-spin text-accent' />
                            <h5 className='text-accent-mute font-medium text-md'>Loading</h5>
                        </div>
                        :
                        <>
                            <Button variant='modalOutline' size='base' text='Cancel' onClick={onClose} />
                            <Button variant='modalBlock' size='base' text='Add Item' onClick={handleSetShowConfirmationModal} />
                        </>
                    }
                </div>

                {showConfirmationModal &&
                    <ConfirmationModal title="Add Product?" content="Are you sure you want to add this product?" onReject={handleSetShowConfirmationModal} onConfirm={handleConfirmModal} />
                }
            </div>

            {/* Sizes and Prices */}
        </div>
    )
}

export default AddProductModal;