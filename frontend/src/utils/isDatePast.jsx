export const isDatePast = (dateStr) => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const [y, mo, d] = dateStr.split('-').map(Number)
	return new Date(y, mo - 1, d) < today
}