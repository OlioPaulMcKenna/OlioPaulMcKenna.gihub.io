import { WindowData } from '../types';

interface CachedData {
  windows: WindowData[];
  viewportSize: { width: number; height: number };
}

export const saveWindowData = (data: CachedData) => {
  localStorage.setItem(
    'advent-calendar-windows',
    JSON.stringify(data)
  );
};

export const getWindowData = (): CachedData | null => {
  const savedData = localStorage.getItem('advent-calendar-windows');
  return savedData ? (JSON.parse(savedData) as CachedData) : null;
};
