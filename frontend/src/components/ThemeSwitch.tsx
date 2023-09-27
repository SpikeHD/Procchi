import Switch from 'preact-material-components/Switch'

import './ThemeSwitch.css'
import 'preact-material-components/Switch/style.css'
import { MoonIcon } from './icons/MoonIcon'
import { SunIcon } from './icons/SunIcon'
import { useState } from 'preact/hooks'

export function ThemeSwitch() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="theme-switch">
      <div className="theme-icon">
        {
          darkMode ? (
            <MoonIcon />
          ) : (
            <SunIcon />
          )
        }
      </div>
      <Switch
        onClick={() => {
          setDarkMode(!darkMode)
          document.documentElement.classList.toggle('theme-dark')

          // Send "rerender graphs" event
          document.dispatchEvent(new Event('rerender-graphs'))
        }}
      />
    </div>
  )
}