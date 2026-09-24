import { TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

/** Last-resort boundary when the shell itself fails to render. */
export default function RouteErrorPage() {
  const error = useRouteError()
  const detail = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : undefined

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description={detail ?? 'ODMS could not load this screen. Reload to try again.'}
        action={
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        }
        className="w-full max-w-md"
      />
    </div>
  )
}
