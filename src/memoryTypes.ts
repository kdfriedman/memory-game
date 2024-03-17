export type Item = {
  sortOrder: number;
};
export type Items = Array<Item>;
type COLOR = 'red' | 'purple' | 'orange' | 'yellow' | 'blue' | 'green';
export type COLORS = Array<COLOR>;
export type MATCHING_COLOR_MAP = {
  [key in COLOR]: {
    count: number;
  };
};
export type SQUARE = {
  id: number;
  defaultColor: string;
  matchingColor: string;
  isMatched: boolean;
  sortOrder: number;
  isActive: boolean;
};
