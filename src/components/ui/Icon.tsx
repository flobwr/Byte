import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '../../theme/colors';

export type IconName =
  | 'home'
  | 'stats'
  | 'profile'
  | 'play'
  | 'pause'
  | 'plus'
  | 'flag'
  | 'sunrise'
  | 'chevronRight'
  | 'stop';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/** Hand-tuned line icons (24×24, rounded joins) — no generic icon font. */
function IconBase({ name, size = 24, color = colors.textPrimary, strokeWidth = 2 }: IconProps) {
  const common = {
    stroke: color,
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
      {name === 'play' && <Path d="M7 5.5 19 12 7 18.5Z" {...common} fill={color} />}
      {name === 'pause' && (
        <>
          <Rect x={6} y={5} width={4} height={14} rx={1.4} fill={color} stroke="none" />
          <Rect x={14} y={5} width={4} height={14} rx={1.4} fill={color} stroke="none" />
        </>
      )}
      {name === 'stop' && <Rect x={6} y={6} width={12} height={12} rx={3} fill={color} stroke="none" />}
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
    </Svg>
  );
}

export const Icon = memo(IconBase);
