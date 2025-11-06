import React, {useState} from 'react';
import { Button, Label, Title } from '../atoms';
import { X, Plus, Upload } from 'lucide-react'

const AddProductModal = ({onConfirm}) => {

    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState(0);

    const [categories] = useState(['drinks', 'cakes', 'cupcakes']);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleRemovePreview = () => setPreview(false);

    const handleConfirmModal = (value) => {
        onConfirm(value);
    }

    const handleSetProductName = (e) => {
        e.preventDefault();

        setProductName(e.target.value);
    }
    const handleSetCategory = (e) => {
        e.preventDefault();

        setCategory(e.target.value);
    }
    const handleSetPrice = (e) => {
        e.preventDefault();

        setPrice(e.target.value);
    }

    const capitalize = (string) => string[0].toUpperCase() + string.slice(1);

    const listCategories = categories.map((item, index) => <option key={index} className='hover:bg-main-dark' value={item}>{capitalize(item)}</option>)

    return (
        <div className='absolute top-0 left-0 w-full h-screen flex justify-center items-center z-1000'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex flex-col gap-2'>
                    <div className="flex justify-between items-center w-full">
                        <Title variant='modal' text='Add New Item' />
                        <X size={16} className='text-text cursor-pointer' onClick={() => handleConfirmModal(false)}/>
                    </div>
                    <Label variant='small' text='Create a new product by filling in the details below' />
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
                                <select className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' onChange={(e) => handleSetCategory(e)}>
                                    {listCategories}
                                </select>

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
                    <div className='flex gap-4 ml-auto'>
                        <Button variant='modalOutline' size='base' text='Cancel' onClick={() => handleConfirmModal(false)}/>
                        <Button variant='modalBlock' size='base' text='Add Item' onClick={() => handleConfirmModal(true)}/>
                    </div>
            </div>
        </div>
    )
}

export default AddProductModal;