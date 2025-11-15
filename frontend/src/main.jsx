import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
	<GoogleOAuthProvider clientId='324648686529-dp5khi6oclvjc9111hcj385apj812men.apps.googleusercontent.com'>
		<StrictMode>
				<BrowserRouter>
					<App />
				</BrowserRouter>
		</StrictMode>
  </GoogleOAuthProvider>
)