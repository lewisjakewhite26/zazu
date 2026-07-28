import type { WordPair } from './supabase';

export type PuzzleTileData = {
  id: string;
  text: string;
  pairId: number;
  side: 'a' | 'b';
};

export type PuzzleTileState = PuzzleTileData & {
  state: 'idle' | 'selected' | 'correct' | 'wrong' | 'gone';
};

export function shuffle<T>(items: T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildBoardTiles(pairs: WordPair[]): PuzzleTileData[] {
  const aItems = shuffle(
    pairs.map((pair, index) => ({ text: pair.a, pairId: index, side: 'a' as const })),
  );
  const bItems = shuffle(
    pairs.map((pair, index) => ({ text: pair.b, pairId: index, side: 'b' as const })),
  );

  const tiles: PuzzleTileData[] = [];
  for (let row = 0; row < pairs.length; row += 1) {
    tiles.push({
      id: `a-${row}-${aItems[row].pairId}`,
      text: aItems[row].text,
      pairId: aItems[row].pairId,
      side: 'a',
    });
    tiles.push({
      id: `b-${row}-${bItems[row].pairId}`,
      text: bItems[row].text,
      pairId: bItems[row].pairId,
      side: 'b',
    });
  }
  return tiles;
}

export function stripHtml(html: string): string {
  return html.replace(/<\/?strong>/g, '').replace(/<[^>]+>/g, '');
}
