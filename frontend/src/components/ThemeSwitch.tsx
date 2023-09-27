import './ThemeSwitch.css'
import { MoonIcon } from './icons/MoonIcon'
import { SunIcon } from './icons/SunIcon'
import { useEffect, useState } from 'preact/hooks'
export function ThemeSwitch() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Read theme from local storage
    const dark = localStorage.getItem('dark')

    if (dark && dark === 'true') {
      toggleTheme()
    }
  }, [])

  function toggleTheme() {
    const dark = !darkMode
    setDarkMode(dark)

    // Set theme
    if (dark) {
      document.documentElement.classList.add('theme-dark')
    } else {
      document.documentElement.classList.remove('theme-dark')
    }

    // Send "rerender graphs" event
    document.dispatchEvent(new Event('rerender-graphs'))

    // Save to local storage
    localStorage.setItem('dark', dark.toString())
  }

  return (
    <div className="theme-switch">
      <div className="theme-icon" onClick={toggleTheme}>
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </div>
    </div>
  )
}