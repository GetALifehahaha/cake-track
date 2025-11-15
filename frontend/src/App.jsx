import {Routes, Route} from 'react-router-dom'
import { Layout, Home, Transactions, NotFound, Login, Inventory, Products, QueueLayout, QueueOverview } from './pages'

const App = () => {
	return (
		<>
			<Routes>
				<Route element={<Layout />}> {/* Change this into protected auth later */}
					<Route path='/' element={<Home />} />
					<Route path='/transactions' element={<Transactions />} />
					<Route path='/inventory' element={<Inventory />} />
					<Route path='/products' element={<Products />} />
					<Route path='/queue' element={<QueueLayout />}> 
						<Route index element={<QueueOverview />}/>
					</Route>
				</Route>
				<Route path='/login' element={<Login />} />
				<Route path='*' element={<NotFound />} />
			</Routes>
		</>
	)
}

export default App