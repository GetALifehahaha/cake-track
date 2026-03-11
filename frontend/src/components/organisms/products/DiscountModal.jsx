import React, {useState, useEffect} from 'react'
import { ModalBody } from '../../molecules'
import { Button } from '../../atoms'
import { ModalFeedbackCard } from '../../molecules';
import { ModalErrorState } from '../../molecules';
import { ConfirmationModal } from '..';
import { Plus, Pen, Trash } from 'lucide-react'
import useDiscount from '@/hooks/useDiscount'
import { CRUDModalSkeleton } from '@/components/molecules/Skeletons';

const DiscountModal = ({onClose}) => {

    const {discountData, discountLoading, discountError, postDiscount, refresh, discountResponse, deleteDiscount} = useDiscount();
    const [discountName, setDiscountName] = useState("")
    const [discountRate, setDiscountRate] = useState("") 
    const [feedback, setFeedback] = useState("");
    const [showConfirmPostModal, setShowConfirmPostModal] = useState();
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState();
    const [prepDeleteId, setPrepDeleteId] = useState(null);

    useEffect(() => {
        refresh();
    }, [discountResponse])

    if (discountLoading) return <CRUDModalSkeleton title='Archived Products' subtitle='View and manage your archived products. You can restore or permanently delete them' onClose={onClose} />
    if (discountError) return <ModalErrorState onClose={onClose} onRetry={refresh} title='Failed to load discounts' details='Unable to load discount data. Please reload and try again.' />

    const resetFeedback = () => setFeedback();
    
    const closeDiscountForm = () => {
        setDiscountName("");
        setDiscountRate("");
    }

    const handleShowConfirmPostModal = () => {
        if (!discountName || !discountRate) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return;
        }
        setShowConfirmPostModal(true);
    }
    
    const handleCloseConfirmPostModal = () => setShowConfirmPostModal(false);

    const handleShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
    const handleCloseConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

    const handlePostDiscount = async () => {
        // Ensure rate is treated as number for API
        await postDiscount({name: discountName, rate: Number(discountRate)/100});

        resetFeedback();
        closeDiscountForm();
        handleCloseConfirmPostModal();
    }

    const prepDeleteDiscount = (id) => {
        setPrepDeleteId(id);
        handleShowConfirmDeleteModal();
    }

    const removePrepDeleteDiscount = () => {
        setPrepDeleteId(null);
        handleCloseConfirmDeleteModal();
    }

    const handleDeleteDiscount = async () => {
        await deleteDiscount(prepDeleteId)
        removePrepDeleteDiscount();
        resetFeedback();
    }

    const handleDiscountName = (e) => {
        if (e.target.value.length > 31) return
        setDiscountName(e.target.value)
    }

    const handleDiscountRate = (e) => {
        if (e.target.value.length > 4) return
        const raw = e.target.value
        if (!/^\d*$/.test(raw)) return
        if (Number(raw) > 100) {
            setDiscountRate("100"); 
            return;
        }
        setDiscountRate(raw)
    }

    const listDiscount = discountData.map((discount, index) => (
        <div 
            key={index} 
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-main-white"
        >
            <div className="flex-1 font-medium text-text flex gap-2">
                <span>{discount.name}</span>
                <span className="text-text/60">({discount.rate * 100}%)</span>
            </div>

            <Button 
                text="Edit" 
                variant="modalOutline" 
                size="fit" 
                icon={Pen} 
            />

            <Button 
                text="Delete" 
                variant="modalBlock" 
                className='bg-error' 
                size="fit" 
                icon={Trash} 
                onClick={() => prepDeleteDiscount(discount.id)} 
            />
        </div>
    ))

    return (
        <ModalBody className='w-[40vw]' title='Manage Discounts' subtitle='Add, edit, or delete discounts for your products' onClose={onClose}>
            <div className='flex flex-col gap-2 w-full'>
                
                {/* Add New Section */}
                <div className="flex flex-col gap-2">
                    <h5 className="text-text">Add New Discount</h5>
                    <div className="flex gap-2">
                        <input 
                            type='text' 
                            value={discountName} 
                            placeholder='Name (e.g. Summer Sale)' 
                            className="flex-2 rounded-md px-3 py-2 bg-main-dark/50 text-text"
                            onChange={handleDiscountName} 
                        /> 
                        <input 
                            type='text' 
                            value={discountRate} 
                            placeholder='Rate %' 
                            className="flex-1 rounded-md px-3 py-2 bg-main-dark/50 text-text"
                            onChange={handleDiscountRate} 
                        />
                        <Button 
                            text="Add" 
                            variant="modalBlock"
                            className='bg-text/50' 
                            size="fit" 
                            icon={Plus}  
                            onClick={handleShowConfirmPostModal}
                        />
                    </div>
                </div>

                {/* List Section */}
                <h5 className="text-text mt-2">Existing Discounts</h5>
                <div className='flex flex-col gap-2 max-h-[30vh] overflow-auto'>
                    {listDiscount}
                </div>
            </div>

            {feedback && 
                <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
            }

            { showConfirmPostModal &&
                <ConfirmationModal 
                    title="Add Discount?" 
                    content="Are you sure you want to add this discount?" 
                    onReject={handleCloseConfirmPostModal} 
                    onConfirm={handlePostDiscount} 
                />
            }
            { showConfirmDeleteModal &&
                <ConfirmationModal 
                    title="Delete Discount?" 
                    content="Are you sure you want to delete this discount?" 
                    onReject={removePrepDeleteDiscount} 
                    onConfirm={handleDeleteDiscount} 
                />
            }
        </ModalBody>
    )
}

export default DiscountModal