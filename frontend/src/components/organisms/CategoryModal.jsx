import React, {useState, useEffect} from 'react'
import { ModalBody } from '../molecules'
import { Button, Title } from '../atoms'
import { ModalFeedbackCard } from '../molecules';
import {ConfirmationModal} from './';
import { Minus, Plus, X } from 'lucide-react'
import useCategory from '@/hooks/useCategory'

const CategoryModal = ({onClose}) => {

    const {categoryData, categoryLoading, categoryError, postCategory, refresh, categoryResponse, deleteCategory} = useCategory();
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categoryName, setCategoryName] = useState("")
    const [feedback, setFeedback] = useState("");
    const [showConfirmPostModal, setShowConfirmPostModal] = useState();
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState();
    const [prepDeleteId, setPrepDeleteId] = useState(null);

    useEffect(() => {
        refresh();
    }, [categoryResponse])

    if (categoryLoading) return <h5>Loading categories...</h5>
    if (categoryError) return <h5>Error loading categories...</h5>

    const handleShowCategoryForm = () => setShowCategoryForm(true);
    const handleCloseCategoryForm = () => setShowCategoryForm(false);

    const handleShowConfirmPostModal = () => setShowConfirmPostModal(true);
    const handleCloseConfirmPostModal = () => setShowConfirmPostModal(false);

    const handleShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
    const handleCloseConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

    const handlePostCategory = async () => {
        if (!categoryName) {
            setFeedback({
                label: 'Incomplete details',
                details: "Please don't leave any blank fields",
                type: 'error'
            })
            return;
        }

        await postCategory({name: categoryName});

        handleCloseConfirmPostModal();
    }

    const prepDeleteCategory = (id) => {
        setPrepDeleteId(id);

        handleShowConfirmDeleteModal();
    }

    const removePrepDeleteCategory = () => {
        setPrepDeleteId(null);

        handleCloseConfirmDeleteModal();
    }

    const handleDeleteCategory = async () => {
        await deleteCategory(prepDeleteId)

        removePrepDeleteCategory();
    }

    const capitalize = (str) => str[0].toUpperCase() + str.slice(1)

    const listCategory = categoryData.map((category, index) => 
        <div key={index} className='text-text font-medium flex gap-2 rounded-md p-2 bg-main-white border border-border'>
            <h5 className='flex-1 p-2'>{capitalize(category.name)}</h5>
            <Button text='' variant='modalOutline' size='fit' icon={Minus} onClick={() => prepDeleteCategory(category.id)} />
        </div>
    )

    return (
        <ModalBody>
            <div className="flex justify-between items-center w-full">
                <Title variant='modal' text='Categories' />
                <X size={16} className='text-text cursor-pointer' onClick={onClose}/>
            </div>

            <div className='flex flex-col gap-2 w-full'>
                {listCategory}
                <div className='ml-auto'>
                    {
                        showCategoryForm ? 
                        <div className='flex flex-row gap-2'>
                            <input 
                                type='text' 
                                value={categoryName} 
                                placeholder='Set category name' 
                                className='rounded-sm p-2 bg-main text-text/75' 
                                onChange={(e) => setCategoryName(e.target.value)} 
                            /> 
                            <Button text='' variant='modalOutline' size='fit' icon={Plus}  onClick={handleShowConfirmPostModal}/>
                            <Button text='' variant='modalOutline' size='fit' icon={X} onClick={handleCloseCategoryForm} />
                        </div>
                        :
                        <Button text='Add Category' variant='modalOutline' size='fit' icon={Plus} onClick={handleShowCategoryForm}/>
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
                <ConfirmationModal 
                    title="Add Category?" 
                    content="Are you sure you want to add this category?" 
                    onReject={handleCloseConfirmPostModal} 
                    onConfirm={handlePostCategory} 
                />
            }

            { showConfirmDeleteModal &&
                <ConfirmationModal 
                    title="Delete Category?" 
                    content="Are you sure you want to delete this category?" 
                    onReject={removePrepDeleteCategory} 
                    onConfirm={handleDeleteCategory} 
                />
            }
        </ModalBody>
    )
}

export default CategoryModal
