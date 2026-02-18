import React, { useState, useEffect } from 'react';
import { Button, Label, Title } from '../../atoms';
import { X } from 'lucide-react';
import { ModalBody, ProductCard } from '../../molecules';
import useProduct from '@/hooks/useProduct';
import ConfirmationModal from '../ConfirmationModal';
import Loading from '../../molecules/Loading';

const ArchivedModal = ({onRestore, onClose}) => {

    const [selectedId, setSelectedId] = useState([]);
    const {data: productData, loading: productLoading, error: productError} = useProduct({isArchived: true});
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (productLoading) return <Loading />
    if (productError) return <h5>Error loading product data</h5>

    
    const handleSetSelectedId = (id) => {
        if (selectedId.some((select) => select === id)) {setSelectedId(selectedId.filter((select) => select !== id))}
        else setSelectedId(selected => [...selected, id]);
    } 

    const handleShowConfirmation = () => {
        if (selectedId.length) setShowConfirmation(true);
    }

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
    }

    const restoreProduct = () => {
        if (selectedId) onRestore(selectedId);

        handleCloseConfirmation();
    }

    
    const listArchivedProducts = productData.results.map((product, index) =>
        <ProductCard selected={selectedId} key={index} product={product} isArchived={true} onToggle={handleSetSelectedId}/>
    )

    return (
        <ModalBody title='Archived Products' subtitle='View and manage your archived products. You can restore or permanently delete them' onClose={() => onClose(false)}>
            <div className='grid grid-cols-6 gap-4 h-120 overflow-y-auto p-2'>
                {listArchivedProducts}
            </div>

            <span className='ml-auto flex gap-2'>
                <Button variant='modalOutline' text='Close' onClick={() => onClose()} />
                <Button variant='modalBlock' text='Restore' suffix={selectedId.length} onClick={handleShowConfirmation} />
            </span>

            {showConfirmation &&
                <ConfirmationModal title="Unarchive product" content="Are you sure you want to restore this product?" onReject={handleCloseConfirmation} onConfirm={restoreProduct} />
            }
        </ModalBody>
    )
}

export default ArchivedModal;