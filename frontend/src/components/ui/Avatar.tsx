import { initials } from '@/utils/format'

type AvatarSize = 'sm' | 'md' | 'lg'

const SIZES: Record<AvatarSize, string> = {
  sm: 'size-7 text-[0.6875rem]',
  md: 'size-8 text-caption',
  lg: 'size-10 text-body',
}

interface AvatarProps {
  name: string
  size?: AvatarSize
  className?: string
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary-subtle font-semibold text-primary-ink select-none ${SIZES[size]} ${className}`}
    >
      {initials(name)}
    </span>
  )
}
