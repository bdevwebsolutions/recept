import { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChefHat, LogIn } from 'lucide-react'
import { useAuth } from '../auth'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      const redirectTo = (location.state as { from?: string } | undefined)?.from || '/recipes'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-smoke via-white to-accent/5 dark:from-[#0f0f23] dark:via-surface-dark dark:to-accent/5">
      <div className="card w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-white mb-4">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Welcome to Recept</h1>
          <p className="text-sm text-muted mt-1">Sign in to manage your recipes</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-center text-muted mt-6">
          First time? Default credentials are admin / admin
        </p>
      </div>
    </div>
  )
}

export default Login
