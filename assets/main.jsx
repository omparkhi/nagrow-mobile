import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AddressProvider } from "./components/context/AddressContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AddressProvider>
      <App />
    </AddressProvider>
  </StrictMode>,
)
