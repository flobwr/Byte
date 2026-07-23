/**
 * Reusable fixed dimensions for repeating UI patterns — mainly the small
 * "mascot thumbnail" chip that shows up in category rows across Home,
 * Stats, Settings and the edit sheets. Centralised so every list row reads
 * the same size instead of drifting file by file.
 */
export const sizes = {
  /** Dense rows (day history). */
  thumbSm: 36,
  /** Standard list rows (distribution, category pickers, settings rows). */
  thumbMd: 44,
  /** Hero-weight thumbnails (home grid cards, sheet headers). */
  thumbLg: 56,
} as const;
