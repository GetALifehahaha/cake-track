import { Routes, Route } from 'react-router-dom'
import {
	Layout,
	Home,
	Transactions,
	NotFound,
	Login,
	Inventory,
	Products,
	QueueLayout,
	QueueOverview,
	QueuePending,
	QueueAccepted,
	QueueCompleted,
	Recipe,
	BusinessDetails,
	Cashier,
	Reports
} from './pages'
import { ProtectedRoute } from './components/organisms'
import { ToastProvider } from './context/ToastContext'

const App = () => {
	return (
		<ToastProvider>
			<Routes>
				<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
					<Route path='/' element={<Home />} />
					<Route path='/transactions' element={<Transactions />} />
					<Route path='/inventory' element={<Inventory />} />
					<Route path='/products' element={<Products />} />
					<Route path='/queue' element={<QueueLayout />}>
						<Route index element={<QueueOverview />} />
						<Route path='pending' element={<QueuePending />} />
						<Route path='accepted' element={<QueueAccepted />} />
						<Route path='completed' element={<QueueCompleted />} />
					</Route>
					<Route path='/recipe' element={<Recipe />} />
					<Route path='/details' element={<BusinessDetails />} />
					<Route path='/cashier' element={<Cashier />} />
				</Route>

				<Route path='/login' element={<Login />} />
				<Route path='*' element={<NotFound />} />
			</Routes>
		</ToastProvider>
	)
}

export default App