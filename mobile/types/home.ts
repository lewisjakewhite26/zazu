export type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
};

export type WordOfDay = {
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
};

export type HomeStats = {
  streak: number;
  coins: number;
};
