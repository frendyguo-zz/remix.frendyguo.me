export type ThemeMode = 'dark' | 'light';

declare global {
  interface Window {
    __theme: ThemeMode;
    __onThemeChange: (theme: ThemeMode) => void;
    __setPreferredTheme: (theme: ThemeMode) => void;
  }
}
