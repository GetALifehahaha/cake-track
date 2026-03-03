export const formatDisplayDate = (dateStr) => {
	const [y, m, d] = dateStr.split('-').map(Number)
	const date = new Date(y, m - 1, d)
	return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}