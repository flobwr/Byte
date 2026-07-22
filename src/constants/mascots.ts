import { type ImageSourcePropType } from 'react-native';

/**
 * The Byte mascot — a pixel-art cat — has one expression per kind of activity.
 * Every image is a transparent, trimmed 512px sprite so it drops naturally
 * onto the dark canvas without a visible frame.
 */
export const MASCOTS = {
  working: require('../../assets/mascot/working.png'),
  writing: require('../../assets/mascot/writing.png'),
  reading: require('../../assets/mascot/reading.png'),
  meditating: require('../../assets/mascot/meditating.png'),
  eating: require('../../assets/mascot/eating.png'),
  coffee: require('../../assets/mascot/coffee.png'),
  sleeping: require('../../assets/mascot/sleeping.png'),
  gaming: require('../../assets/mascot/gaming.png'),
  phone: require('../../assets/mascot/phone.png'),
  music: require('../../assets/mascot/music.png'),
  sport: require('../../assets/mascot/sport.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export type MascotKey = keyof typeof MASCOTS;

/** Shown when the day hasn't started yet. */
export const IDLE_MASCOT: MascotKey = 'sleeping';
/** Shown while the global stopwatch is running with no declared activity. */
export const RUNNING_MASCOT: MascotKey = 'working';
