import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {RouterProvider} from "react-router";
import '@fontsource-variable/manrope';
import '@fontsource-variable/playfair-display';

import {router} from "@/routes";
import './index.css'

const savedTheme = localStorage.getItem('color-theme')
const initialDarkMode = savedTheme === 'dark'
document.documentElement.classList.toggle('dark', initialDarkMode)
document.documentElement.style.colorScheme = initialDarkMode ? 'dark' : 'light'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
