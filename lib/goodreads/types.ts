export interface CurrentBook {
  title: string;
  author: string;
  url: string;
}

export interface ReadingChallenge {
  year: number;
  read: number;
  goal: number;
  url: string;
}

export interface GoodreadsData {
  currentlyReading: CurrentBook[];
  challenge: ReadingChallenge | null;
}
