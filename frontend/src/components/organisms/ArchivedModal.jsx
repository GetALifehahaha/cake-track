import React, { useState, useEffect } from 'react';
import { Button, Label, Title } from '../atoms';
import { EllipsisVertical, X } from 'lucide-react';
import { ProductCard } from '../molecules';
import useProduct from '@/hooks/useProduct';
import ConfirmationModal from './ConfirmationModal';
import Loading from '../molecules/Loading';
import ConfirmationModalWrapper from './ConfirmationModalWrapper';

const ArchivedModal = ({onRestore, onClose}) => {

    const [selectedId, setSelectedId] = useState(null);
    const {productData, productLoading, productError} = useProduct({isArchived: true})
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (productLoading) return <Loading />
    if (productError) return <h5>Error loading product data</h5>

    const handleSetSelectedId = (id) => {
        if (id == selectedId) {setSelectedId(null)}
        else {setSelectedId(id)}
    } 

    const handleShowConfirmation = () => {
        setShowConfirmation(true);
    }

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
    }

    const restoreProduct = () => {
        if (selectedId) onRestore({id: selectedId, is_archived: false});

        handleCloseConfirmation();
    }

    
    const listArchivedProducts = productData.results.map((product, index) =>
        <div className='relative'>
        <ProductCard  selected={selectedId} key={index} product={product} isArchived={true} onToggle={handleSetSelectedId}/>
        <div className='absolute top-2 right-2 cursor-pointer bg-white rounded-md'>
            <EllipsisVertical className='text-text/50 ' onClick={() => setSelectedId(product.id ? product.id : null)}/>
            {selectedId === product.id &&
            <ConfirmationModalWrapper title='Restore product?' content='This will bring it back to the POS' onConfirm={restoreProduct}>
                <h5>Restore</h5>
            </ConfirmationModalWrapper>
            }
        </div>
        </div>
    )

    return (
        <div className='absolute top-0 left-0 w-full bg-black/10 backdrop-blur-sm h-screen flex justify-center items-center z-10'>
            <div className='p-6 bg-main-white rounded-xl shadow-md shadow-black/25 min-w-[30vw] flex flex-col gap-10'>
                <div className='flex flex-col gap-2'>
                    <div className="flex justify-between items-center w-full">
                        <Title variant='modal' text='Archived Products' />
                        <X size={16} className='text-text cursor-pointer' onClick={() => onClose(false)}/>
                    </div>
                    <Label variant='small' text='View and manage your archived products. You can restore or permanently delete them' />
                </div>
                
                {/* <input type='text' className='px-4 py-2 rounded-sm bg-main-dark/50 focus:outline-none w-full' value={searchArchived} placeholder='Search products' onChange={(e) => setSearchArchived(e.target.value)}/> */}

                <div className='grid grid-cols-3 gap-4 h-80 overflow-y-auto p-2'>
                    {listArchivedProducts}
                </div>

                <span className='ml-auto flex gap-2'>
                    <Button variant='modalOutline' text='Close' onClick={() => onClose()} />
                    <Button variant='modalBlock' text='Restore' onClick={handleShowConfirmation} />
                </span>

                {showConfirmation &&
                    <ConfirmationModal title="Unarchive product" content="Are you sure you want to restore this product?" onReject={handleCloseConfirmation} onConfirm={restoreProduct} />
                }
            </div>
        </div>
    )
}

export default ArchivedModal;