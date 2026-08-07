import { useLocalSearchParams } from 'expo-router';

import { GymMcqSessionScreen } from '@/components/gym/GymMcqSessionScreen';
import { copy } from '@/constants/copy';

export default function GymMcqRoute() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const modeLabel = mode === 'usage' ? copy.gymModes.usageLabel : copy.gymModes.rootsLabel;

  return <GymMcqSessionScreen modeLabel={modeLabel} />;
}
