import {Routes, Route} from 'react-router-dom'
import { Layout, Home, Records, NotFound, Login } from './pages'

const App = () => {
	return (
		<>
			<Routes>
				<Route element={<Layout />}> {/* Change this into protected auth later */}
					<Route path='/' element={<Home />} />
					<Route path='/records' element={<Records />} />
				</Route>
				<Route path='/login' element={<Login />} />
				<Route path='*' element={<NotFound />} />
			</Routes>
		</>
	)
}

export default App