import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Book, ChefHat, LogOut, Moon, Plus, Sun, Users } from 'lucide-react'
import { useAuth } from '../auth'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  return (
    <>
      {/* Desktop header */}
      <header className="top-nav">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <NavLink to="/recipes" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
              <ChefHat size={20} />
            </div>
            <span className="hidden sm:block text-lg font-bold text-ink dark:text-white">Recept</span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink
              to="/recipes"
              className={({ isActive }) => `nav-link-desktop ${isActive ? 'active' : ''}`}
            >
              <Book size={18} />
              Recipes
            </NavLink>
            <NavLink
              to="/add"
              className={({ isActive }) => `nav-link-desktop ${isActive ? 'active' : ''}`}
            >
              <Plus size={18} />
              Add
            </NavLink>
            {user?.isAdmin && (
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link-desktop ${isActive ? 'active' : ''}`}
              >
                <Users size={18} />
                Users
              </NavLink>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around py-2">
          <NavLink
            to="/recipes"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Book size={22} />
            <span className="nav-link-label">Recipes</span>
          </NavLink>
          <NavLink
            to="/add"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Plus size={22} />
            <span className="nav-link-label">Add</span>
          </NavLink>
          {user?.isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={22} />
              <span className="nav-link-label">Users</span>
            </NavLink>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar
