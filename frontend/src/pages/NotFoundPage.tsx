import { House, MapPinOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader title="Page not found" breadcrumb={false} />
      <EmptyState
        icon={MapPinOff}
        title="This page doesn't exist"
        description="The address may be mistyped, or the module is not available yet."
        action={
          <Button variant="primary" icon={House} onClick={() => navigate('/dashboard')}>
            Go to Home
          </Button>
        }
      />
    </>
  )
}
