import React, {useState, useEffect} from 'react'
import { ModalBody } from '../../molecules'
import { Button } from '../../atoms'
import { ModalFeedbackCard } from '../../molecules';
import {ConfirmationModal} from '..';
import { Plus, Pen, Trash, X, Check } from 'lucide-react'
import useCategory from '@/hooks/useCategory'
import { CRUDModalSkeleton } from '@/components/molecules/Skeletons';

const CategoryModal = ({onClose}) => {

    const {categoryData, categoryLoading, categoryError, postCategory, patchCategory, refresh, deleteCategory} = useCategory();
    
    const [categoryName, setCategoryName] = useState("")
    
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    const [feedback, setFeedback] = useState("");
    const [showConfirmPostModal, setShowConfirmPostModal] = useState();
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState();
    const [prepDeleteId, setPrepDeleteId] = useState(null);

    if (categoryLoading) return <CRUDModalSkeleton title='Manage Categories' subtitle='Add, edit, or delete categories for organizing your products' onClose={onClose} />
    if (categoryError) return <h5>Error loading categories...</h5>

    const resetFeedback = () => {
        setFeedback();
    }

    const handleShowConfirmPostModal = () => {
        if (!categoryName) {
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

    const handlePostCategory = async () => {
        await postCategory({name: categoryName});
        setCategoryName(""); 
        resetFeedback();
        handleCloseConfirmPostModal();
    }

    const handleCategoryName = (e) => {
        e.preventDefault();
        if (e.target.value.length > 50) return;
        setCategoryName(e.target.value)
    }

    const handleShowConfirmDeleteModal = () => setShowConfirmDeleteModal(true);
    const handleCloseConfirmDeleteModal = () => setShowConfirmDeleteModal(false);

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
        resetFeedback();
        removePrepDeleteCategory();
    }

    const handleStartEdit = (category) => {
        setEditingId(category.id);
        setEditName(category.name);
        resetFeedback();
    }

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
    }

    const handleEditNameChange = (e) => {
        if (e.target.value.length > 50) return;
        setEditName(e.target.value);
    }

    const handleSaveEdit = async () => {
        if (!editName.trim()) return;
        
        await patchCategory(editingId, { name: editName });
        
        handleCancelEdit();
        refresh();
    }


    const capitalize = (str) => str[0].toUpperCase() + str.slice(1)

    const listCategory = categoryData.map(category => {
        const isEditing = editingId === category.id;

        return (
            <div
                key={category.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-main-white"
            >
                {isEditing ? (
                    // --- Edit Mode UI ---
                    <>
                        <input
                            type="text"
                            value={editName}
                            autoFocus
                            className="flex-1 rounded-md px-3 py-2 bg-main-dark/50 text-text"
                            onChange={handleEditNameChange}
                        />
                        
                        <Button
                            text="Save"
                            variant="modalBlock" // Dark button
                            size="fit"
                            onClick={handleSaveEdit}
                        />

                        <Button
                            text="Cancel"
                            variant="modalOutline" // Light button
                            size="fit"
                            onClick={handleCancelEdit}
                        />
                    </>
                ) : (
                    // --- Display Mode UI ---
                    <>
                        <span className="flex-1 font-medium text-text">
                            {capitalize(category.name)}
                        </span>

                        <Button
                            text="Edit"
                            variant="modalOutline"
                            size="fit"
                            icon={Pen}
                            onClick={() => handleStartEdit(category)}
                        />

                        <Button
                            text="Delete"
                            variant="modalBlock"
                            className='bg-error'
                            size="fit"
                            icon={Trash}
                            onClick={() => prepDeleteCategory(category.id)}
                        />
                    </>
                )}
            </div>
        )
    })
    

    return (
        <ModalBody className='w-[40vw]' title='Manage Categories' subtitle='Add, edit, or delete categories for organizing your products' onClose={onClose}>
            <div className='flex flex-col gap-2 w-full'>
                <div className="flex flex-col gap-2">
                    <h5 className="text-text">Add New Category</h5>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={categoryName}
                            placeholder="Category name (e.g., Drinks, Cakes)"
                            className="flex-1 rounded-md px-3 py-2 bg-main-dark/50 text-text"
                            onChange={handleCategoryName}
                        />

                        <Button
                            text="Add"
                            icon={Plus}
                            variant="modalBlock"
                            className='bg-text/50'
                            onClick={handleShowConfirmPostModal}
                        />
                    </div>
                </div>

                <h5 className="text-text mt-2">Existing Categories</h5>
                <div className='flex flex-col gap-2 max-h-[30vh] overflow-auto'>
                    {listCategory}
                </div>
            </div>

            {feedback && 
                <ModalFeedbackCard label={feedback.label} details={feedback.details} type={feedback.type}  />
            }

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