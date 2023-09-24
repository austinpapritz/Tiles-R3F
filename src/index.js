import { createRoot } from 'react-dom/client'
import { Suspense } from 'react'
import { Html } from '@react-three/drei'
import { Logo } from '@pmndrs/branding'
import './styles.css'
import { App } from './App'

createRoot(document.getElementById('root')).render(
	<>
		<App />
	</>
)
