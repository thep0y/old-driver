import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import '~/styles/index.scss'
import Selecter from '~/components/Selecter'
// import TitleBar from '~/components/TitleBar'
import ImageList from '~/components/ImageList'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Selecter />
  }, {
    path: '/image-list',
    element: <ImageList />
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <TitleBar /> */}
    <RouterProvider router={router} />
  </React.StrictMode>
)
