import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '~/styles/index.scss'
// import TitleBar from '~/components/TitleBar'

const Select = lazy(async () => await import('~/components/Selecter'))
const ImageList = lazy(async () => await import('~/components/ImageList'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <React.Suspense>
        <Select />
      </React.Suspense>
    )
  },
  {
    path: '/image-list',
    element: (
      <React.Suspense>
        <ImageList />
      </React.Suspense>
    )
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <TitleBar /> */}
    <RouterProvider router={router} />
  </React.StrictMode>
)
