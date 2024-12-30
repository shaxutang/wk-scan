import { createHashRouter } from 'react-router-dom'
import Home from './pages'
import Objects from './pages/objects'
import Rules from './pages/rules'
import Scan from './pages/scan'
import Settings from './pages/settings'

export const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/objects',
    element: <Objects />,
  },
  {
    path: '/rules',
    element: <Rules />,
  },
  {
    path: '/scan',
    element: <Scan />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
])
