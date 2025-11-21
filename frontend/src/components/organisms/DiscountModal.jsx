import React, {useState, useEffect} from 'react'
import { ModalBody } from '../molecules'
import { Button, Title } from '../atoms'
import { ModalFeedbackCard } from '../molecules';
import {ConfirmationModal} from './';
import { Minus, Plus, X } from 'lucide-react'
import useDiscount from '@/hooks/useDiscount'

const DiscountModal = ({onClose}) => {

    const {discountData, discountLoading, discountError, postDiscount, refresh, discountResponse, deleteDiscount} = useDiscount();
    const [showDiscountForm, setShowDiscountForm] = useState(false);
    const [discountName, setDiscountName] = useState("")
    const [discountRate, setDiscountRate] = useState(0)
    const [feedback, setFeedback] = useState("");
    const [showConfirmPostModal, setShowConfirmPostModal] = useState();
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState();
    const [prepDeleteId, setPrepDeleteId] = useState(null);

    useEffect(() => {
        refresh();
    }, [discountResponse])

    if (discountLoading) return <h5>Loading discount...</h5>
    if (discountError) return <h5>Error loading discount...</h5>

    const handleShowDiscountForm = () => setShowDiscountForm(true);
    const handleCloseDiscountForm = () => setShowDiscountForm(false);

    const handleShowConfirmPostModal = () => setShowConfirmPostModal(true);
    const handleCloseConfirmPostModal = () => setShowConfirmPostModal(false);

    const handleShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
    const handleCloseConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

    const handlePostDiscount = async () => {
        if (!discountName || !discountRate) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return;
        }

        await postDiscount({name: discountName, rate: discountRate/100});

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
    }

    const listDiscount = discountData.map((discount, index) => 
        <div key={index} className='text-text font-medium flex gap-2 rounded-md p-2 bg-main-white border border-border'>
            <h5 className='flex-1 p-2'>{discount.name}</h5>
            <h5 className='basis-1/4 p-2 text-center'>{discount.rate * 100}%</h5>
            <Button text='' variant='modalOutline' size='fit' icon={Minus} onClick={() => prepDeleteDiscount(discount.id)} />
        </div>
    )

    return (
        <ModalBody>
            <div className="flex justify-between items-center w-full">
                <Title variant='modal' text='Discounts' />
                <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
            </div>

            <div className='flex flex-col gap-2 w-full'>
                {listDiscount}
                <div className='ml-auto'>
                    {
                        showDiscountForm ? 
                        <div className='flex flex-row gap-2'>
                            <input type='text' value={discountName} placeholder='Set discount name' className='rounded-sm p-2 bg-main text-text/75' onChange={(e) => setDiscountName(e.target.value)} /> 
                            <input type='number' value={discountRate} placeholder='Set discount rate' className='rounded-sm p-2 bg-main text-text/75' onChange={(e) => setDiscountRate(e.target.value)} />
                            <Button text='' variant='modalOutline' size='fit' icon={Plus}  onClick={handleShowConfirmPostModal}/>
                            <Button text='' variant='modalOutline' size='fit' icon={X} onClick={handleCloseDiscountForm} />
                        </div>
                        :
                        <Button text='Add Discount' variant='modalOutline' size='fit' icon={Plus} onClick={handleShowDiscountForm}/>
                    }
                </div>
            </div>

            {feedback && 
                <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
            }

            <div className='flex gap-4 ml-auto'>
                <Button variant='modalOutline' size='base' text='Close' onClick={onClose}/>
            </div>

            { showConfirmPostModal &&
                <ConfirmationModal title="Add Discount?" content="Are you sure you want to add this discount?" onReject={handleCloseConfirmPostModal} onConfirm={handlePostDiscount} />
            }
            { showConfirmDeleteModal &&
                <ConfirmationModal title="Delete Discount?" content="Are you sure you want to delete this disccount?" onReject={removePrepDeleteDiscount} onConfirm={handleDeleteDiscount} />
            }
        </ModalBody>
    )
}

export default DiscountModal