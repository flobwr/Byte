import { Easing } from 'react-native-reanimated';

/**
 * Shared motion language. Every interaction in the app pulls its timing and
 * easing from here so presses, reveals and transitions feel like one system —
 * discreet, never bouncy, always the same.
 */
export const motion = {
  duration: {
    press: 160, // tap feedback
    tab: 200, // bottom-bar transition
    reveal: 380, // element entrance
    value: 700, // number count-up / bar growth
    glow: 2600, // ambient loops
  },
  easing: {
    // Smooth deceleration — the default for presses and reveals.
    standard: Easing.out(Easing.quad),
    inOut: Easing.inOut(Easing.quad),
  },
  /** Unified press feedback (buttons + cards): subtle scale + slight dim. */
  press: {
    scale: 0.97,
    cardScale: 0.975,
    dim: 0.94,
  },
} as const;
