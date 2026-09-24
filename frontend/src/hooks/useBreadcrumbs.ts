import { useMatches } from 'react-router-dom'
import type { Crumb, RouteHandle } from '@/types'

type Match = ReturnType<typeof useMatches>[number]

function resolveCrumb(match: Match): Crumb | undefined {
  const crumb = (match.handle as RouteHandle | undefined)?.crumb
  return typeof crumb === 'function' ? crumb(match.params) : crumb
}

export function useBreadcrumbs(): Crumb[] {
  return useMatches().flatMap((match) => {
    const crumb = resolveCrumb(match)
    return crumb ? [{ label: crumb.label, to: crumb.to ?? match.pathname }] : []
  })
}

export function useRouteTitle(): string | undefined {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as RouteHandle | undefined
    if (handle?.title) return handle.title
    const crumb = resolveCrumb(matches[i])
    if (crumb) return crumb.label
  }
  return undefined
}
