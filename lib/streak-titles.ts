const STREAK_TITLES: Array<[number, string]> = [
  [1, 'Early Riser'],
  [7, 'Early Riser'],
  [14, 'Auroral'],
  [30, 'Dawn Chaser'],
  [60, 'Diurnal'],
  [100, 'Chronobiologist'],
  [365, 'Matutinal'],
];

export function getStreakTitle(streak: number): string {
  let title = 'Early Riser';
  for (const [days, label] of STREAK_TITLES) {
    if (streak >= days) title = label;
  }
  return title;
}
