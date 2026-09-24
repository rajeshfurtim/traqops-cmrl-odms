import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import RouteErrorPage from '@/pages/RouteErrorPage'
import { getRegister } from '@/modules/registers/definitions'
import type { RouteHandle } from '@/types'

const handle = (h: RouteHandle) => h

/** Each module page is its own chunk, fetched the first time the route is visited. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default })

/*
 * Every module renders inside <AppShell>. Breadcrumbs and document titles
 * come from each route's `handle`, so nested routes such as
 * /registers/incident only need `handle({ crumb: { label: 'Incident Register' } })`.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage />, handle: handle({ title: 'Home', crumb: { label: 'Home' } }) },
      {
        path: 'station-diary',
        handle: handle({ crumb: { label: 'Station Diary', to: '/station-diary' } }),
        children: [
          {
            index: true,
            lazy: page(() => import('@/modules/station-diary/pages/DiaryShiftPage')),
            handle: handle({ title: 'Station Diary' }),
          },
          {
            path: 'summary',
            lazy: page(() => import('@/modules/station-diary/pages/ShiftSummaryPage')),
            handle: handle({ crumb: { label: 'Shift Summary' } }),
          },
          {
            path: 'shifts/:shiftId',
            lazy: page(() => import('@/modules/station-diary/pages/DiaryShiftPage')),
            handle: handle({
              // "CEN01-2026-09-24-B" → "Shift B, 24/09/2026"
              crumb: ({ shiftId = '' }) => {
                const [, y, m, d, shift] = shiftId.split('-')
                return { label: shift ? `Shift ${shift}, ${d}/${m}/${y}` : 'Shift' }
              },
            }),
          },
        ],
      },
      {
        path: 'registers',
        handle: handle({ crumb: { label: 'Registers', to: '/registers' } }),
        children: [
          { index: true, lazy: page(() => import('@/modules/registers/pages/RegistersHomePage')) },
          {
            path: ':registerId',
            lazy: page(() => import('@/modules/registers/pages/RegisterPage')),
            handle: handle({ crumb: ({ registerId }) => ({ label: getRegister(registerId)?.label ?? 'Register' }) }),
          },
        ],
      },
      { path: '*', element: <NotFoundPage />, handle: handle({ crumb: { label: 'Not found' } }) },
    ],
  },
])
