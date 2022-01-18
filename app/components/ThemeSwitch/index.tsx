import { useState, useCallback, useEffect } from 'react';
import cx from 'classnames';
import { ThemeMode } from '~/types/window';
import SunIcon from './sun';
import MoonIcon from './moon';

const ThemeSwitch = () => {
  const [theme, setTheme] = useState<ThemeMode | null>(null);

  useEffect(() => {
    setTheme(window.__theme);
    window.__onThemeChange = () => {
      setTheme(window.__theme);
    };
  }, []);

  const handleChange = useCallback((e) => {
    window.__setPreferredTheme(
      e.target.checked ? 'dark' : 'light'
    );
  }, []);

  const isDarkTheme = theme === 'dark';
  if (!theme) return null;
  
  return (
    <div className="w-[50px] h-[28px] inline-block relative">
      <input
        type="checkbox"
        id="toggle"
        className="w-0 h-0 invisible absolute -top-4 -left-4"
        onChange={handleChange}
        checked={isDarkTheme}
      />
      <label
        htmlFor="toggle"
        className={cx("w-[52px] h-[30px] bg-gradient-to-tr rounded-full inline-block cursor-pointer", {
          'from-fuchsia-400 to-orange-500': !isDarkTheme,
          'from-blue-500 to-indigo-300': isDarkTheme,
        })}
      >
        <div
          className={cx('absolute top-[3px] rounded-full w-[24px] h-[24px] bg-white transition-all duration-150 ease-out shadow flex justify-center items-center', {
            'left-[25px]': isDarkTheme,
            'left-[3px]': !isDarkTheme
          })}
        >
          {
            isDarkTheme
              ? <MoonIcon />
              : <SunIcon />
          }
        </div>
      </label>
  </div>
  );
};

export default ThemeSwitch;