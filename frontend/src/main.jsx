import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<GoogleOAuthProvider clientId='324648686529-dp5khi6oclvjc9111hcj385apj812men.apps.googleusercontent.com'>
			<AuthProvider>
				<StrictMode>
						<App />
				</StrictMode>
			</AuthProvider>
		</GoogleOAuthProvider>
	</BrowserRouter>
)