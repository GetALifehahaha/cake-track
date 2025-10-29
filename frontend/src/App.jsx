import {Routes, Route} from 'react-router-dom'
import { Layout, Home } from './pages'

const App = () => {
	return (
		<>
			<Routes>
				<Route element={<Layout />}> {/* Change this into protected auth later */}
					<Route path='/' element={<Home />} />
				</Route>
			</Routes>
		</>
	)
}

export default App