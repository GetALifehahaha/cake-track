import { useState } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react' 


const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const MiniCalendar = ({ selectedDates = [], disabledDates = [], onToggleDate }) => {
	const today = new Date()
	const [viewYear, setViewYear] = useState(today.getFullYear())
	const [viewMonth, setViewMonth] = useState(today.getMonth())

	const firstDay = new Date(viewYear, viewMonth, 1).getDay()
	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

	const prevMonth = () => {
		if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
		else setViewMonth(m => m - 1)
	}
	const nextMonth = () => {
		if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
		else setViewMonth(m => m + 1)
	}

	const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

	const cells = []
	for (let i = 0; i < firstDay; i++) cells.push(null)
	for (let d = 1; d <= daysInMonth; d++) cells.push(d)

	return (
		<div className='select-none'>
			<div className='flex items-center justify-between mb-3'>
				<button onClick={prevMonth} className='p-1 rounded hover:bg-main-dark/50 transition-colors'>
					<ChevronLeft size={16} className='text-text/60' />
				</button>
				<span className='text-sm font-semibold text-text'>{MONTHS[viewMonth]} {viewYear}</span>
				<button onClick={nextMonth} className='p-1 rounded hover:bg-main-dark/50 transition-colors'>
					<ChevronRight size={16} className='text-text/60' />
				</button>
			</div>

			<div className='grid grid-cols-7 mb-1'>
				{DAYS.map(d => (
					<span key={d} className='text-center text-xs font-semibold text-text/40 py-1'>{d}</span>
				))}
			</div>

			<div className='grid grid-cols-7 gap-0.5'>
				{cells.map((day, i) => {
					if (!day) return <span key={i} />
					const key = toKey(viewYear, viewMonth, day)
					const isSelected = selectedDates.includes(key)
					const isPast = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
					const isAlreadyBlocked = disabledDates.includes(key)
					const isDisabled = isPast || isAlreadyBlocked

					return (
						<button
							key={i}
							disabled={isDisabled}
							onClick={() => onToggleDate(key)}
							title={isAlreadyBlocked ? 'Already blocked' : undefined}
							className={`
								aspect-square w-full text-xs rounded-lg font-medium transition-all
								${isDisabled ? 'text-text/20 cursor-not-allowed' : 'cursor-pointer hover:bg-main-dark/50'}
								${isAlreadyBlocked ? 'bg-error/10 line-through' : ''}
								${isSelected ? 'bg-accent-mute text-white hover:bg-accent-mute/80' : 'text-text'}
							`}
						>
							{day}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default MiniCalendar