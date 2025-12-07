import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<ToastProvider>
			<AuthProvider>
				<GoogleOAuthProvider clientId={clientId}>
					<StrictMode>
							<App />
					</StrictMode>
				</GoogleOAuthProvider>
			</AuthProvider>
		</ToastProvider>
	</BrowserRouter>
)