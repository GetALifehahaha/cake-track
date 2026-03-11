import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { OpeningProvider } from './context/OpeningContext'
import AppErrorBoundary from './components/organisms/AppErrorBoundary'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<ToastProvider>
			<AppErrorBoundary>
				<AuthProvider>
					<OpeningProvider>
						<GoogleOAuthProvider clientId={clientId}>
							<StrictMode>
									<App />
							</StrictMode>
						</GoogleOAuthProvider>
					</OpeningProvider>
				</AuthProvider>
			</AppErrorBoundary>
		</ToastProvider>
	</BrowserRouter>
)