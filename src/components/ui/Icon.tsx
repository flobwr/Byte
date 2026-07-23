import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useColors } from '../../theme/ThemeContext';

export type IconName =
  | 'home'
  | 'stats'
  | 'profile'
  | 'calendar'
  | 'play'
  | 'pause'
  | 'plus'
  | 'flag'
  | 'sunrise'
  | 'chevronRight'
  | 'chevronLeft'
  | 'stop'
  | 'edit'
  | 'undo'
  | 'settings'
  | 'trash'
  | 'check'
  | 'close'
  | 'sun'
  | 'moon';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/** Hand-tuned line icons (24×24, rounded joins) — no generic icon font. */
function IconBase({ name, size = 24, color, strokeWidth = 2 }: IconProps) {
  const colors = useColors();
  const resolvedColor = color ?? colors.textPrimary;
  const common = {
    stroke: resolvedColor,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path d="M3 10.8 12 3l9 7.8V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" {...common} />}
      {name === 'stats' && (
        <>
          <Path d="M4 20V10" {...common} />
          <Path d="M10 20V4" {...common} />
          <Path d="M16 20v-7" {...common} />
          <Path d="M22 20H2" {...common} />
        </>
      )}
      {name === 'profile' && (
        <>
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M4 21a8 8 0 0 1 16 0" {...common} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={3.5} y={5} width={17} height={16} rx={3} {...common} />
          <Path d="M3.5 10h17M8 3v4M16 3v4" {...common} />
        </>
      )}
      {name === 'play' && <Path d="M7 5.5 19 12 7 18.5Z" {...common} fill={resolvedColor} />}
      {name === 'pause' && (
        <>
          <Rect x={6} y={5} width={4} height={14} rx={1.4} fill={resolvedColor} stroke="none" />
          <Rect x={14} y={5} width={4} height={14} rx={1.4} fill={resolvedColor} stroke="none" />
        </>
      )}
      {name === 'stop' && <Rect x={6} y={6} width={12} height={12} rx={3} fill={resolvedColor} stroke="none" />}
      {name === 'plus' && (
        <>
          <Path d="M12 5v14" {...common} />
          <Path d="M5 12h14" {...common} />
        </>
      )}
      {name === 'flag' && (
        <>
          <Path d="M5 21V4" {...common} />
          <Path d="M5 4h11l-2 3.5L16 11H5" {...common} />
        </>
      )}
      {name === 'sunrise' && (
        <>
          <Path d="M12 3v4M4.5 10.5 6 12M19.5 10.5 18 12M2 18h20M5 22h14" {...common} />
          <Path d="M8 18a4 4 0 0 1 8 0" {...common} />
        </>
      )}
      {name === 'chevronRight' && <Path d="m9 6 6 6-6 6" {...common} />}
      {name === 'chevronLeft' && <Path d="m15 6-6 6 6 6" {...common} />}
      {name === 'edit' && (
        <>
          <Path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" {...common} />
          <Path d="M14 6.5 17.5 10" {...common} />
        </>
      )}
      {name === 'undo' && (
        <>
          <Path d="M7 7 3.5 10.5 7 14" {...common} />
          <Path d="M3.5 10.5H14a6 6 0 0 1 0 12H9" {...common} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3.2} {...common} />
          <Path
            d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.55 1.55M7.85 16.15 6.3 17.7M17.7 17.7l-1.55-1.55M7.85 7.85 6.3 6.3"
            {...common}
          />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M5 7h14M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" {...common} />
          <Path d="M7 7l1 13a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9l1-13" {...common} />
        </>
      )}
      {name === 'check' && <Path d="m5 12.5 4.5 4.5L19 7" {...common} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6 6 18" {...common} />}
      {name === 'sun' && (
        <>
          <Circle cx={12} cy={12} r={4.2} {...common} />
          <Path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" {...common} />
        </>
      )}
      {name === 'moon' && <Path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.5 6.5 0 0 0 10.2 10.2Z" {...common} />}
    </Svg>
  );
}

export const Icon = memo(IconBase);
