// Developer Signature
const signatureStyle = "color: #00ff00; font-size: 16px; font-weight: bold; background: #111; padding: 12px; border-radius: 6px; border: 1px solid #00ff00; font-family: monospace;";

console.log(
  "%c🚀 Built & Engineered by Rahul Kumar 🚀",
  signatureStyle
);

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
