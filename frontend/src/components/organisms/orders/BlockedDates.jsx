import { useState } from "react"
import { ModalBody } from "@/components/molecules"
import MiniCalendar from "./MiniCalendar"
import { X } from "lucide-react"

const BlockedDates = ({ onClose, onConfirm, existingDates = [] }) => {
	const [selectedDates, setSelectedDates] = useState([])

	const toggleDate = (key) => {
		setSelectedDates(prev =>
			prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]
		)
	}

	return (
		<ModalBody title="Block Dates" subtitle="Select one or more dates to block from order availability." onClose={onClose} className='max-w-[60vw] max-h-[90vh]'>

			<MiniCalendar selectedDates={selectedDates} disabledDates={existingDates} onToggleDate={toggleDate} />

			<div className='flex gap-2 mt-5'>
				<button
					onClick={onClose}
					className='flex-1 py-2 rounded-lg border border-border text-sm font-medium text-text/60 hover:bg-main-dark/30 transition-colors cursor-pointer'
				>
					Cancel
				</button>
				<button
					onClick={() => selectedDates.length > 0 && onConfirm(selectedDates)}
					disabled={selectedDates.length === 0}
					className='flex-1 py-2 rounded-lg bg-accent-mute text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-mute/80 transition-colors cursor-pointer'
				>
					Block {selectedDates.length > 0 ? `(${selectedDates.length})` : ''}
				</button>
			</div>
		</ModalBody>
	)
}

export default BlockedDates