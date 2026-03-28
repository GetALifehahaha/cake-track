import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	Layout,
	Home,
	Transactions,
	Discounts,
	NotFound,
	Login,
	Inventory,
	Products,
	QueueLayout,
	QueueOverview,
	QueuePending,
	QueueAccepted,
	QueueCompleted,
	QueueOrderAvailability,
	Recipe,
	BusinessDetails,
	Cashier,
	Reports,
	QueueReady,
	QueueRejected,
	ForgotPassword,
	SetAccount,
	Cakes,
	QueueHistory,
} from './pages'
import { ProtectedRoute } from './components/organisms'

const queryClient = new QueryClient();

const App = () => {
	useEffect(() => {
		const handleAuthLogin = () => {
			queryClient.clear();
		};

		window.addEventListener('auth:login', handleAuthLogin);
		return () => window.removeEventListener('auth:login', handleAuthLogin);
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<Routes>
				<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
					<Route path='/' element={<Home />} />
					<Route path='/transactions' element={<Transactions />} />
					<Route path='/discounts' element={<Discounts />} />
					<Route path='/inventory' element={<Inventory />} />
					<Route path='/products' element={<Products />} />
					<Route path='/queue' element={<QueueLayout />}>
						<Route index element={<QueueOverview />} />
						<Route path='pending' element={<QueuePending />} />
						<Route path='accepted' element={<QueueAccepted />} />
						<Route path='ready' element={<QueueReady />} />
						<Route path='completed' element={<QueueCompleted />} />
						<Route path='rejected' element={<QueueRejected />} />
						<Route path='history' element={<QueueHistory />} />
						<Route path='availability' element={<QueueOrderAvailability />} />
					</Route>
					<Route path='/recipe' element={<Recipe />} />
					<Route path='/cakes' element={<Cakes />} />
					<Route path='/reports' element={<Reports />} />
					<Route path='/details' element={<BusinessDetails />} />
					<Route path='/cashier' element={<Cashier />} />
				</Route>

				<Route path='/login' element={<Login />} />
				<Route path='/404' element={<NotFound />} />
				<Route path='/setAccount' element={<SetAccount />}/>
				<Route path='/forgotPassword' element={<ForgotPassword />}/>
				<Route path='*' element={<NotFound />} />
			</Routes>
		</QueryClientProvider>
	)
}

export default App