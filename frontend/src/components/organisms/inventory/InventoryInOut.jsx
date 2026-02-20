import React, { useEffect, useState } from 'react'
import { Button } from '../../atoms';
import { ModalBody, DatePicker } from '../../molecules'
import useIngredient from '@/hooks/useIngredient';
import { Title } from '../../atoms';
import { X } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import useInventoryTransaction from '@/hooks/useInventoryTransaction';
import Loading from '../../molecules/Loading';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils/cn';

const InventoryInOut = ({ onConfirm, onClose }) => {

	const { addToast } = useToast();
	const { ingredientAll, ingredientLoading, ingredientError } = useIngredient();
	const { postInventoryTransaction, inventoryTransactionLoading, inventoryTransactionError } = useInventoryTransaction();
	const [ingredientItems, setIngredientItems] = useState([]);
	const [showConfirm, setShowConfirm] = useState(false);
	const [search, setSearch] = useState('');
	
	if (ingredientLoading || inventoryTransactionLoading) return <Loading />
	if (ingredientError) return <h5>Error</h5>
	if (inventoryTransactionError) return <h5>Error</h5>

	const handleSearch = (e) => {
		e.preventDefault();

		if (e.target.value.length > 50) return;

		setSearch(e.target.value);
	}


	const addIngredientItem = (id, name, max_quantity) => {
		if (ingredientItems.some(ingredient => ingredient.ingredient_id === id)) return;

		setIngredientItems(prev => [
			...prev,
			{ ingredient_id: id, name: name, amount: 0, transaction_type: 'in', expiration_date: '', purchase_date: '', max_quantity: Number.parseFloat(max_quantity) }
		]);
	};

	const removeIngredientItem = (index) => {
		setIngredientItems(ingredientItems.filter((_, i) => i !== index));
	};

	const updateIngredientItem = (index, field, e) => {
		e.preventDefault();

		const raw = e.target.value

		if (!/^\d*\.?\d{0,2}$/.test(raw)) return

		if (ingredientItems[index].transaction_type === "out" && e.target.value > ingredientItems[index].max_quantity) return

		if (e.target.value.length > 13) return

		const updatedField = ingredientItems.map((item, i) => {
			return index === i ? { ...item, [field]: field === "amount" && e.target.value > 0 ? Number.parseFloat(e.target.value) : e.target.value }
				:
				item
		}
		)

		setIngredientItems(updatedField)
	}

	const updateTransactionType = (index, value) => {
		const updatedField = ingredientItems.map((item, i) => {
			return index === i ? { ...item, transaction_type : value }
				:
				item
		}
		)

		if (value == "out") {
			updatedField[index].expiration_date = '',
			updatedField[index].purchase_date = '';
			updatedField[index].amount = 0
		}

		setIngredientItems(updatedField)
	}

	const updateIngredientDates = (index, field, value) => {
		const updatedField = ingredientItems.map((item, i) => {
			return index === i ? { ...item, [field]: field === "amount" && value > 0 ? Number.parseFloat(value) : value }
				:
				item
		}
		)

		setIngredientItems(updatedField)
	}

	const handleSetShowConfirm = () => setShowConfirm(true);
	const handleSetCloseConfirm = () => setShowConfirm(false);

	const validateUpdate = () => {
		if (ingredientItems.length === 0) return;

		setShowConfirm(true);
	}

	const formatDate = (date) => {
		if (!date) return null;
		const offset = date.getTimezoneOffset();
		const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
		return adjustedDate.toISOString().split('T')[0];
	};

	const updateIngredients = async () => {
		const payload = {
			transactions: ingredientItems.map(item => ({
				ingredient_id: item.ingredient_id,
				amount: item.amount,
				transaction_type: item.transaction_type,
				purchase_date: item.transaction_type === 'in' 
					? formatDate(item.purchase_date) 
					: formatDate(new Date()), 
				...(item.transaction_type === 'in' && {
					expiration_date: formatDate(item.expiration_date)
				})
			}))
		};

		try {
			await postInventoryTransaction(payload);
			addToast("Ingredients updated successfully")
		} catch (err) {
			addToast("Failed to update ingredients")
		}


		handleSetCloseConfirm()
		onClose()
	}

	const filteredIngredients = ingredientAll.filter(ing => 
        ing.name.toLowerCase().includes(search.toLowerCase())
    );

	const listIngredients = filteredIngredients.map((ingredient) =>
		<div key={ingredient.id} className='flex flex-col gap-2 px-4 py-2 rounded-md bg-main-white text-sm font-medium transition-all cursor-pointer' onClick={() => addIngredientItem(ingredient.id, ingredient.name, ingredient.total_stock)}>
			<h5 className='text-text line-clamp-2'>{ingredient.name}</h5>
			<h5 className='text-text/50'>Stock: {(ingredient.total_stock).replace(/\.00$/, '')} {ingredient.unit.abbreviation}</h5>
		</div>
	)

	const listIngredientItems = ingredientItems.map((ingredient, index) =>
		<div className='flex flex-col gap-2 w-full p-2 rounded-md bg-main-white border-2 border-border/50 h-fit' key={index}>
			<div className='flex items-center gap-2 p-2 w-full ' >
				<h5 className='mr-auto'>{ingredient.name}</h5>

				{ingredient.transaction_type == "in" &&
					<div className='basis-1/3 flex gap-2 flex-row justify-end pb-2 ml-auto'>
						<div className='flex flex-col gap-1 w-full'>
							<h5 className='text-xs text-left uppercase font-medium text-text/50'>Purchase Date</h5>
							<DatePicker className='rounded-md' selected={ingredient.purchase_date} onSelect={(value) => updateIngredientDates(index, 'purchase_date', value)} />
						</div>
						<div className='flex flex-col gap-1 w-full'>
							<h5 className='text-xs text-left uppercase font-medium text-text/50'>Expiration Date</h5>
							<DatePicker className='rounded-md' selected={ingredient.expiration_date} onSelect={(value) => updateIngredientDates(index, 'expiration_date', value)} />
						</div>
					</div>
				}

				<div className='flex flex-col gap-1 pb-2'>
					<h5 className='text-xs text-left uppercase font-medium text-text/50'>Quantity</h5>
					<input type='text' className='p-2 py-1.5 bg-main-dark/50 rounded-md focus:outline-none' placeholder='Enter Amount' value={ingredient.amount} onChange={(e) => updateIngredientItem(index, 'amount', e)} />
				</div>

				<div className='flex flex-row gap-2 w-36'>
					<button className={cn('px-2 py-1.5 rounded-md bg-success border border-success text-white flex-1 text-sm', ingredient.transaction_type !== "in" && 'bg-main-white text-success')} onClick={() => updateTransactionType(index, 'in')}>IN</button>
					<button className={cn('px-2 py-1.5 rounded-md bg-error border border-error text-white flex-1 text-sm', ingredient.transaction_type !== "out" && 'bg-main-white text-error')} onClick={() => updateTransactionType(index, 'out')}>OUT</button>
				</div>
				<X size={16} className='text-text cursor-pointer mx-4' onClick={() => removeIngredientItem(index)} />
			</div>

		</div>
	)

	return (
		<ModalBody title='Inventory Management' onClose={onClose} className='w-[90vw] h-[90vh]'>
			{/* Two Panel Layout */}
			<div className='flex flex-1 overflow-hidden max-h-[90vh] bg-accent-mute/25'>
				{/* Left Panel - Available Ingredients */}
				<div className='basis-1/4 flex flex-col '>
					<div className='px-6 py-4 h-16 flex items-center gap-2'>
						<div className='h-full w-1 rounded-full bg-accent-text' />
						<h3 className='font-semibold text-sm tracking-wide'>Available Ingredients</h3>
					</div>
					<div className='flex-1 overflow-y-auto px-6 py-4'>
						<input type='text' placeholder='Search an ingredient' value={search} onChange={(e) => handleSearch(e)} className='bg-main-white rounded-md focus:outline-none w-full p-2.5 mb-6' />
						<div className='flex flex-col gap-2'>
							{listIngredients}
						</div>
					</div>
				</div>

				{/* Right Panel - Transaction Items */}
				<div className='flex-1 flex flex-col bg-white'>
					<div className='px-6 py-4 '>
						<h3 className='font-semibold text-sm tracking-wide'>Transaction Items ({ingredientItems.length})</h3>
					</div>
					<div className='flex-1 overflow-y-auto px-6 py-4'>
						{ingredientItems.length === 0 ? (
							<div className='flex items-center justify-center h-full text-gray-400'>
								<div className='text-center'>
									<p className='text-lg font-medium mb-2'>No items selected</p>
									<p className='text-sm'>Click ingredients from the left panel to add them</p>
								</div>
							</div>
						) : (
							<div className='grid gap-4'>
								{listIngredientItems}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
				<Button variant='modalOutline' text='Cancel' onClick={onClose} />
				<Button variant='modalBlock' text='Update Stocks' onClick={validateUpdate} className={ingredientItems.length == 0 && 'opacity-50'} />
			</div>

			{showConfirm &&
				<ConfirmationModal
					title="Update stocks?"
					content="Are you sure you want to update your stocks?"
					onConfirm={updateIngredients}
					onReject={() => setShowConfirm(false)}
				/>
			}
		</ModalBody>
	)
}

export default InventoryInOut