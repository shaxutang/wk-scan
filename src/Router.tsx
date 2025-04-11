import { createHashRouter } from 'react-router'
import Home from './pages'
import Objects from './pages/objects'
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
    path: '/scan',
    element: <Scan />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
])
