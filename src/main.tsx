import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import Selecter from '~/components/Selecter'
import TitleBar from '~/components/TitleBar'
import '~/styles/index.scss'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Selecter />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TitleBar />
    <RouterProvider router={router} />
  </React.StrictMode>
)
