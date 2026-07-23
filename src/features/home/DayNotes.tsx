import { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { useTimerStore } from '../../stores/timerStore';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';

type DayNotesProps = {
  dayKey: string;
  note: string;
};

/** A single free-text note per day — "bonne journée", "fatigué", whatever. */
export function DayNotes({ dayKey, note }: DayNotesProps) {
  const colors = useColors();
  const setNote = useTimerStore((s) => s.setNote);
  const [value, setValue] = useState(note);

  useEffect(() => setValue(note), [note]);

  return (
    <Card padding="xl" cornerRadius="xxl">
      <AppText variant="title3" style={styles.title}>
        Notes
      </AppText>
      <TextInput
        multiline
        value={value}
        onChangeText={setValue}
        onBlur={() => {
          if (value !== note) setNote(dayKey, value);
        }}
        placeholder="Écris ce que tu veux sur cette journée…"
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, { color: colors.textPrimary }]}
        textAlignVertical="top"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.md },
  input: { minHeight: 64, fontSize: 15, lineHeight: 21, padding: 0 },
});
