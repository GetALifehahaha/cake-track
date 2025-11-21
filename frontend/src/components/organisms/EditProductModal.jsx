import React, {useState, useEffect} from 'react';
import { Button, Dropdown, Label, Title } from '../atoms';
import { X, Plus, Upload } from 'lucide-react'
import { ModalFeedbackCard } from '../molecules';
import { ConfirmationModal } from '.';

const EditProductModal = ({product, categoryOptions, onConfirm, onClose}) => {

    const [productName, setProductName] = useState(product.name);
    const [category, setCategory] = useState(product.category.id);
    const [price, setPrice] = useState(product.price);
    const [imagePath, setImagePath] = useState(product.image_path)

    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [archiveConfirmation, setArchiveConfirmation] = useState(false);
    
    const [preview, setPreview] = useState(product.image_path);

    const [feedback, setFeedback] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImagePath(file)
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleRemovePreview = () => {setPreview(null)};

    const handleConfirmModal = () => {

        let params = {};

        if (productName != product.name) params.name = productName;
        if (category != product.category) params.category_id = category;
        if (price != product.price) params.price = price;
        if (imagePath != product.image_path) params.image_path = imagePath;

        if (Object.keys(params).length === 0) onClose();

        onConfirm(params);
    }

    const handleSetProductName = (e) => {
        e.preventDefault();

        setProductName(e.target.value);
    }
    const handleSetCategory = (value) => {

        setCategory(value);
    }
    const handleSetPrice = (e) => {
        e.preventDefault();

        setPrice(e.target.value);
    }

    const handleSetShowConfirmationModal = () => {
        if (!productName || !category || !price || !preview) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return
        };

        setShowConfirmationModal(!showConfirmationModal);
    }

    const handleArchive = () => onConfirm({is_archived: true})

    const handleSetArchiveConfirmation = () => setArchiveConfirmation(!archiveConfirmation)

    return (
        <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex flex-col gap-2'>
                    <div className="flex justify-between items-center w-full">
                        <Title variant='modal' text='Edit product details' />
                        <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
                    </div>
                </div>

                <div className='flex gap-8'>
                    <div className='flex flex-col gap-2'>
                        <Label variant='modal' text='Product Image' />
                        <label className='h-60 flex flex-col items-center justify-center gap-2 rounded-xl border-border border aspect-square'>
                            {(preview) ? 
                            <img src={preview} className='object-cover h-full w-full rounded-xl'/>
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
                                onChange={handleFileChange}
                            />
                        </label>
                        {preview && <Button variant='icon' text='' icon={X} onClick={handleRemovePreview}/>}
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
                            <Label variant='modal' text='Product Price' />
                            <input 
                            type='number' 
                            className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={price} placeholder='P 0.00' onChange={(e) => handleSetPrice(e)}/>
                        </div>
                    </div>
                </div>

                {feedback && 
                    <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
                }
                <div className='flex gap-4 ml-auto'>
                    <Button variant='modalBlock' size='base' text='Archive Item' onClick={handleSetArchiveConfirmation}/>
                    <Button variant='modalOutline' size='base' text='Cancel' onClick={onClose}/>
                    <Button variant='modalBlock' size='base' text='Save' onClick={handleSetShowConfirmationModal}/>
                </div>

                {showConfirmationModal &&
                    <ConfirmationModal title="Edit Product?" content="Are you sure you want to edit this product?" onReject={handleSetShowConfirmationModal} onConfirm={handleConfirmModal} />
                }
                {archiveConfirmation &&
                    <ConfirmationModal title="Archive Product?" content="Are you sure you want to archive this product? You can get it back from the archives" onReject={handleSetArchiveConfirmation} onConfirm={handleArchive} />
                }
            </div>
        </div>
    )
}

export default EditProductModal;