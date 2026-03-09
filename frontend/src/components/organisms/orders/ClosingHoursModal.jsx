import { useState } from 'react'
import { ModalBody } from '@/components/molecules'

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const ClosingHoursModal = ({ onClose, onConfirm, current }) => {
	const [startTime, setStartTime] = useState(current?.start_time ?? '08:00')
	const [endTime, setEndTime] = useState(current?.end_time ?? '17:00')
	const [openDays, setOpenDays] = useState(current?.open_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])

	const toggleDay = (day) => {
		setOpenDays(prev =>
			prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
		)
	}

	const handleSubmit = () => {
		if (!startTime || !endTime) return
		if (openDays.length === 0) return
		onConfirm({ start_time: startTime, end_time: endTime, open_days: openDays })
	}

	return (
		<ModalBody title='Edit Operating Hours' subtitle='Set the bakery open/close times and working days.' onClose={onClose}>
			<div className='flex flex-col gap-5'>

				{/* Time inputs */}
				<div className='flex gap-4'>
					<div className='flex-1 flex flex-col gap-1.5'>
						<label className='text-xs font-semibold text-text/60'>Opening Time</label>
						<input
							type='time'
							value={startTime}
							onChange={e => setStartTime(e.target.value)}
							className='w-full border border-border rounded-lg px-3 py-2 text-sm bg-main-white text-text focus:outline-none focus:ring-2 focus:ring-accent-mute/40'
						/>
					</div>
					<div className='flex-1 flex flex-col gap-1.5'>
						<label className='text-xs font-semibold text-text/60'>Closing Time</label>
						<input
							type='time'
							value={endTime}
							onChange={e => setEndTime(e.target.value)}
							className='w-full border border-border rounded-lg px-3 py-2 text-sm bg-main-white text-text focus:outline-none focus:ring-2 focus:ring-accent-mute/40'
						/>
					</div>
				</div>

				{/* Day toggles */}
				<div className='flex flex-col gap-2'>
					<label className='text-xs font-semibold text-text/60'>Open Days</label>
					<div className='flex gap-2 flex-wrap'>
						{ALL_DAYS.map(day => {
							const active = openDays.includes(day)
							return (
								<button
									key={day}
									type='button'
									onClick={() => toggleDay(day)}
									className={`
										px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
										${active
											? 'bg-accent-mute text-white border-accent-mute'
											: 'bg-transparent text-text/50 border-border hover:border-accent-mute/40'}
									`}
								>
									{day}
								</button>
							)
						})}
					</div>
					{openDays.length === 0 && (
						<p className='text-xs text-error'>Select at least one open day.</p>
					)}
				</div>

				{/* Actions */}
				<div className='flex gap-2 mt-1'>
					<button
						onClick={onClose}
						className='flex-1 py-2 rounded-lg border border-border text-sm font-medium text-text/60 hover:bg-main-dark/30 transition-colors cursor-pointer'
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={openDays.length === 0}
						className='flex-1 py-2 rounded-lg bg-accent-mute text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-mute/80 transition-colors cursor-pointer'
					>
						Save Changes
					</button>
				</div>
			</div>
		</ModalBody>
	)
}

export default ClosingHoursModal
