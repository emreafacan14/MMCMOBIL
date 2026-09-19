/**
 * StyleSheet-side design tokens. Tailwind classes (tailwind.config.js) and
 * these constants must stay in sync — use classes first, constants for what
 * classes cannot express (gradients, shadows, exact rgba in StyleSheet).
 */
export const colors = {
  base: "#070810",
  elevated: "#101221",
  surface: "rgba(246,247,255,0.055)",
  surfaceStrong: "rgba(246,247,255,0.105)",
  line: "rgba(190,196,255,0.14)",
  ink: "#F7F8FF",
  muted: "#A7ADC4",
  faint: "#6B728F",
  primary: "#7667F8",
  primaryStrong: "#A89DFF",
  primaryDim: "#24204E",
  accent: "#5AD7FF",
  sky: "#8AB9F2",
  gold: "#E9C98B",
  success: "#51D6A3",
  danger: "#FF7485",
  warning: "#F5C76B",
} as const;

export const radius = {
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
} as const;

/** Card visual gradient (deep purple -> indigo, matches the brand mockup). */
export const cardGradient = {
  colors: ["#7667F8", "#342E73", "#111426"],
  locations: [0, 0.48, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

/** Subtle radial glow used behind hero elements. */
export const glowShadow = {
  shadowColor: colors.primary,
  shadowOpacity: 0.3,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 12 },
  elevation: 14,
} as const;

export const appVersion = "1.0.0";
