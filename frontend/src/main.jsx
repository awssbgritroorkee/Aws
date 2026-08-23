// Minimalist Developer Signature Badge
const nameStyle = "color: #ffffff; font-size: 12px; font-weight: bold; background: #1a1a1a; padding: 4px 8px; border-radius: 4px 0 0 4px; font-family: sans-serif;";
const roleStyle = "color: #ffffff; font-size: 12px; font-weight: bold; background: #007bff; padding: 4px 8px; border-radius: 0 4px 4px 0; font-family: sans-serif;";

console.log(
  "%cBuilt & Engineered by Rahul Kumar%cTech Lead",
  nameStyle,
  roleStyle
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
