/** Mirrors Tailwind's md / lg / xl breakpoints. */
export const MEDIA = {
  /** ≥ 768px — tablet: icon rail + header menu */
  md: '(min-width: 768px)',
  /** ≥ 1024px — desktop: persistent, collapsible sidebar */
  lg: '(min-width: 1024px)',
  /** ≥ 1280px — wide desktop: sidebar expanded by default */
  xl: '(min-width: 1280px)',
} as const
