import React, { useState } from 'react'
import { X, Plus, Trash2, Clock, CalendarOff, Edit2 } from 'lucide-react'
import { Title } from '../../components/atoms'
import { useToast } from '@/context/ToastContext'
import { formatTime } from '../../utils/formatTime.js'
import { BlockedDates, ClosingHoursModal, ConfirmationModal } from '@/components/organisms'
import { isDatePast } from '@/utils/isDatePast'
import { formatDisplayDate } from '@/utils/formatDisplayDate'
import useOrder from '@/hooks/useOrders'
import useOperatingHours from '@/hooks/useOperatingHours'
import Loading from '@/components/molecules/Loading'

const QueueOrderAvailability = () => {
	const { addToast } = useToast()

	const { blockedDates, blockDates, unblockDates, blockedDatesLoading, blockedDatesError } = useOrder()
	const { operatingHours, loading: hoursLoading, updateOperatingHours } = useOperatingHours()

	const [selectedDates, setSelectedDates] = useState([])
	const [showBlockModal, setShowBlockModal] = useState(false)
	const [showHoursModal, setShowHoursModal] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [filter, setFilter] = useState('upcoming')

	const upcomingDates = blockedDates
		.filter(d => !isDatePast(d.date))
		.map(d => ({ id: d.id, date: d.date }))
		.sort((a, b) => new Date(a.date) - new Date(b.date))

	const pastDates = blockedDates
		.filter(d => isDatePast(d.date))
		.map(d => ({ id: d.id, date: d.date }))
		.sort((a, b) => new Date(a.date) - new Date(b.date))

	const displayDates = filter === 'upcoming'
		? upcomingDates
		: filter === 'past'
			? pastDates
			: [...upcomingDates, ...pastDates]

	const handleBlockDates = async (dates) => {
		try {
			await blockDates(dates)
			setShowBlockModal(false)
			addToast(`${dates.length} date(s) blocked successfully`, 'success')
		} catch (err) {
			const errorData = err.response?.data
			const dateError = errorData?.dates?.[0] || errorData?.dates
			const generalError = errorData?.detail || 'An unexpected error occurred'
			addToast(`Failed to block dates: ${dateError || generalError}`, 'error')
		}
	}

	const handleSaveHours = async (hours) => {
		try {
			await updateOperatingHours(hours)
			setShowHoursModal(false)
			addToast('Operating hours updated successfully', 'success')
		} catch {
			addToast('Failed to update operating hours', 'error')
		}
	}

	const handleDeleteSelected = async () => {
		try {
			await unblockDates([...selectedDates])
			setSelectedDates([])
			setShowDeleteModal(false)
			addToast('Selected dates unblocked', 'success')
		} catch (err) {
			const errorData = err.response?.data
			const dateError = errorData?.dates?.[0] || errorData?.dates
			const generalError = errorData?.detail || 'An unexpected error occurred'
			addToast(`Failed to unblock dates: ${dateError || generalError}`, 'error')
		}
	}

	const toggleSelectDate = (dateItem) => {
		setSelectedDates(prev =>
			prev.includes(dateItem.id) ? prev.filter(id => id !== dateItem.id) : [...prev, dateItem.id]
		)
	}

	const toggleSelectAll = () => {
		setSelectedDates(selectedDates.length === displayDates.length ? [] : displayDates.map(d => d.id))
	}

	if (blockedDatesLoading || hoursLoading) return <Loading />
	if (blockedDatesError) return <h5>Error...</h5>

	return (
		<div className='flex flex-col gap-6'>

			{/* ── Top cards row ── */}
			<div className='flex gap-4'>

				{/* Operating Hours Card */}
				<div className='flex-1 p-5 bg-main-white rounded-xl border border-border'>
					<div className='flex justify-between items-start mb-4'>
						<div className='flex items-center gap-2'>
							<span className='p-2 bg-accent-mute/10 rounded-lg'>
								<Clock size={16} className='text-accent-mute' />
							</span>
							<Title variant='modal' text='Operating Hours' />
						</div>
						<button
							onClick={() => setShowHoursModal(true)}
							className='flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/70 transition-colors cursor-pointer'
						>
							<Edit2 size={13} />
							Edit
						</button>
					</div>

					<div className='flex flex-col gap-3'>
						<div className='flex items-center justify-between p-3 bg-main-dark/30 rounded-lg'>
							<span className='text-xs text-text/50 font-medium'>Hours</span>
							<span className='text-sm font-semibold text-text'>
								{formatTime(operatingHours?.start_time)} – {formatTime(operatingHours?.end_time)}
							</span>
						</div>
						<div>
							<span className='text-xs text-text/50 font-medium block mb-2'>Open Days</span>
							<div className='flex gap-1 flex-wrap'>
								{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
									<span
										key={day}
										className={`
											text-xs px-2.5 py-0.5 rounded-full font-medium border
											${operatingHours?.open_days?.includes(day)
												? 'bg-accent-mute/10 text-accent-mute border-accent-mute/20'
												: 'bg-transparent text-text/25 border-border/50'}
										`}
									>
										{day}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Summary Card */}
				<div className='flex-1 p-5 bg-main-white rounded-xl border border-border'>
					<div className='flex items-center gap-2 mb-4'>
						<span className='p-2 bg-error/10 rounded-lg'>
							<CalendarOff size={16} className='text-error' />
						</span>
						<Title variant='modal' text='Blocked Date Summary' />
					</div>
					<div className='grid grid-cols-3 gap-3'>
						<div className='flex flex-col items-center justify-center p-3 bg-main-dark/30 rounded-lg'>
							<span className='text-2xl font-bold text-text'>{blockedDates.length}</span>
							<span className='text-xs text-text/50 font-medium mt-0.5'>Total</span>
						</div>
						<div className='flex flex-col items-center justify-center p-3 bg-error/5 border border-error/10 rounded-lg'>
							<span className='text-2xl font-bold text-error'>{upcomingDates.length}</span>
							<span className='text-xs text-text/50 font-medium mt-0.5'>Upcoming</span>
						</div>
						<div className='flex flex-col items-center justify-center p-3 bg-main-dark/30 rounded-lg'>
							<span className='text-2xl font-bold text-text/40'>{pastDates.length}</span>
							<span className='text-xs text-text/50 font-medium mt-0.5'>Past</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Blocked Dates Table ── */}
			<div className='p-5 bg-main-white rounded-xl border border-border'>

				<div className='flex justify-between items-center pb-4 border-b border-b-border'>
					<Title variant='modal' text='Blocked Dates' />

					<div className='flex items-center gap-2'>
						{/* Filter tabs */}
						<div className='flex border border-border rounded-lg overflow-hidden text-xs'>
							{[['upcoming', 'Upcoming'], ['past', 'Past'], ['all', 'All']].map(([val, label]) => (
								<button
									key={val}
									onClick={() => { setFilter(val); setSelectedDates([]) }}
									className={`px-3 py-1.5 font-medium transition-colors cursor-pointer
										${filter === val ? 'bg-accent-mute text-white' : 'text-text/60 hover:bg-main-dark/40'}`}
								>
									{label}
								</button>
							))}
						</div>

						{selectedDates.length > 0 && (
							<button
								onClick={() => setShowDeleteModal(true)}
								className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/80 transition-colors cursor-pointer'
							>
								<Trash2 size={13} />
								Unblock ({selectedDates.length})
							</button>
						)}

						<button
							onClick={() => setShowBlockModal(true)}
							className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-mute text-white text-xs font-semibold hover:bg-accent-mute/80 transition-colors cursor-pointer'
						>
							<Plus size={13} />
							Block Dates
						</button>
					</div>
				</div>

				{/* Table column headers */}
				{displayDates.length > 0 && (
					<div className='flex items-center px-3 py-2 mt-2'>
						<span className='w-8 flex justify-center'>
							<input
								type='checkbox'
								checked={selectedDates.length === displayDates.length && displayDates.length > 0}
								onChange={toggleSelectAll}
								className='accent-accent-mute cursor-pointer'
							/>
						</span>
						<span className='flex-1 text-xs font-semibold text-text/40 uppercase tracking-wide'>Date</span>
						<span className='w-24 text-xs font-semibold text-text/40 uppercase tracking-wide text-center'>Status</span>
						<span className='w-16 text-xs font-semibold text-text/40 uppercase tracking-wide text-right'>Action</span>
					</div>
				)}

				{/* Rows */}
				<div className='flex flex-col min-h-40'>
					{displayDates.length === 0 ? (
						<div className='flex-1 flex items-center justify-center py-12'>
							<div className='flex flex-col items-center gap-2'>
								<CalendarOff size={28} className='text-text/20' />
								<h5 className='text-text/40 font-semibold text-sm'>No blocked dates</h5>
								<p className='text-text/30 text-xs'>Click "Block Dates" to restrict order availability</p>
							</div>
						</div>
					) : (
						displayDates.map(({ id, date }, i) => {
							const past = isDatePast(date)
							const isChecked = selectedDates.includes(id)

							return (
								<div
									key={id}
									onClick={() => toggleSelectDate({ id, date })}
									className={`
										flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors
										${i !== displayDates.length - 1 ? 'border-b border-b-main-dark' : ''}
										${isChecked ? 'bg-accent-mute/5' : 'hover:bg-main-dark/30'}
									`}
								>
									<span className='w-8 flex justify-center' onClick={e => e.stopPropagation()}>
										<input
											type='checkbox'
											checked={isChecked}
											onChange={() => toggleSelectDate({ id, date })}
											className='accent-accent-mute cursor-pointer'
										/>
									</span>

									<span className='flex-1'>
										<h5 className={`text-sm font-medium ${past ? 'text-text/40' : 'text-text'}`}>
											{formatDisplayDate(date)}
										</h5>
										<h5 className='text-xs text-text/30'>{date}</h5>
									</span>

									<span className='w-24 flex justify-center'>
										<span className={`
											text-xs font-semibold px-3 py-0.5 rounded-full border
											${past
												? 'text-text/40 border-border bg-transparent'
												: 'text-error border-error/30 bg-error/5'}
										`}>
											{past ? 'Passed' : 'Blocked'}
										</span>
									</span>

									<span className='w-16 flex justify-end'>
										<button
											onClick={(e) => {
												e.stopPropagation()
												setSelectedDates([id])
												setShowDeleteModal(true)
											}}
											className='p-1.5 rounded-lg hover:bg-error/10 text-text/30 hover:text-error transition-colors cursor-pointer'
										>
											<Trash2 size={14} />
										</button>
									</span>
								</div>
							)
						})
					)}
				</div>
			</div>

			{/* ── Modals ── */}
			{showBlockModal && (
				<BlockedDates
					onClose={() => setShowBlockModal(false)}
					onConfirm={handleBlockDates}
					existingDates={blockedDates.map(d => d.date)}
				/>
			)}

			{showHoursModal && (
				<ClosingHoursModal
					onClose={() => setShowHoursModal(false)}
					onConfirm={handleSaveHours}
					current={operatingHours}
				/>
			)}

			{showDeleteModal && (
				<ConfirmationModal
					title={`Delete (${selectedDates.length}) Blocked Dates?`}
					content='Are you sure you want to delete these blocked dates?'
					onConfirm={handleDeleteSelected}
					onReject={() => setShowDeleteModal(false)}
				/>
			)}
		</div>
	)
}

export default QueueOrderAvailability