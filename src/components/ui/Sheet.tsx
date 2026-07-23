import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  withTiming,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';

import { useShadows } from '../../theme/shadows';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DURATION_IN = 200;
const DURATION_OUT = 190;
const OFFSET = 10; // px — "quelques pixels", never a slide-up
const EASE_IN = Easing.out(Easing.cubic);
const EASE_OUT = Easing.in(Easing.cubic);

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: DimensionValue;
};

/**
 * Shared bottom-sheet chrome (backdrop + card) used by every full-screen
 * picker/editor in the app. Two things are deliberately non-obvious:
 *
 * 1. The animation is hand-built (not a Reanimated preset + springify) so
 *    the motion stays exactly "fade + a few px", never a bounce or a big
 *    slide — matching the rest of the app's restrained motion language.
 * 2. <Modal> itself is *never* conditionally unmounted. Toggling its own
 *    `visible` prop is what actually releases the native touch-blocking
 *    overlay; unmounting the Modal element mid-exit-animation raced its
 *    native teardown against Reanimated's and left touches blocked for
 *    up to a second after the sheet had visually closed. Here, closing
 *    only flips `visible` on the native Modal once the exit animation's
 *    `runOnJS` callback confirms it actually finished.
 */
export function Sheet({ visible, onClose, children, maxHeight = '88%' }: SheetProps) {
  const colors = useColors();
  const shadows = useShadows();

  const [modalVisible, setModalVisible] = useState(visible);
  const [renderContent, setRenderContent] = useState(visible);
  const wantsVisible = useRef(visible);
  wantsVisible.current = visible;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setRenderContent(true);
    } else {
      setRenderContent(false);
    }
  }, [visible]);

  const handleExitComplete = useCallback(() => {
    if (!wantsVisible.current) setModalVisible(false);
  }, []);

  const sheetEntering: EntryExitAnimationFunction = useCallback(() => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: OFFSET }] },
      animations: {
        opacity: withTiming(1, { duration: DURATION_IN, easing: EASE_IN }),
        transform: [{ translateY: withTiming(0, { duration: DURATION_IN, easing: EASE_IN }) }],
      },
    };
  }, []);

  const sheetExiting: EntryExitAnimationFunction = useCallback(() => {
    'worklet';
    return {
      initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
      animations: {
        opacity: withTiming(0, { duration: DURATION_OUT, easing: EASE_OUT }, (finished) => {
          if (finished) runOnJS(handleExitComplete)();
        }),
        transform: [
          { translateY: withTiming(OFFSET * 0.6, { duration: DURATION_OUT, easing: EASE_OUT }) },
        ],
      },
    };
  }, [handleExitComplete]);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {renderContent && (
        <>
          <AnimatedPressable
            entering={FadeIn.duration(DURATION_IN).easing(EASE_IN)}
            exiting={FadeOut.duration(DURATION_OUT).easing(EASE_OUT)}
            style={[styles.backdrop, { backgroundColor: colors.scrim }]}
            onPress={onClose}
          />
          <View pointerEvents="box-none" style={styles.wrap}>
            <Animated.View
              entering={sheetEntering}
              exiting={sheetExiting}
              style={[
                styles.sheet,
                shadows.lg,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.hairlineStrong,
                  maxHeight,
                },
              ]}
            >
              <View style={styles.handle} />
              {children}
            </Animated.View>
          </View>
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.35)',
    marginBottom: spacing.lg,
  },
});
