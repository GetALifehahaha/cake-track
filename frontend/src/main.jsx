import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import AppErrorBoundary from './components/organisms/AppErrorBoundary'

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.getRegistrations().then((registrations) => {
		registrations.forEach((registration) => {
			registration.unregister()
		})
	})
}

if ('caches' in window) {
	window.caches.keys().then((cacheNames) => {
		cacheNames.forEach((cacheName) => {
			window.caches.delete(cacheName)
		})
	})
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<ToastProvider>
			<AppErrorBoundary>
				<AuthProvider>
					<GoogleOAuthProvider clientId={clientId}>
						<StrictMode>
							<App />
						</StrictMode>
					</GoogleOAuthProvider>
				</AuthProvider>
			</AppErrorBoundary>
		</ToastProvider>
	</BrowserRouter>
)