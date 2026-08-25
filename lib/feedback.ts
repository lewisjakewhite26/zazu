import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** The lightest tick available — for a tap that just changes a selection, not a result. */
export function hapticSelect(): void {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync();
}

export function hapticCorrect(): void {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticWrong(): void {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function hapticSuccess(): void {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
