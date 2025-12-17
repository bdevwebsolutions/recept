import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, KeyRound } from 'lucide-react'
import { useAuth } from '../auth'

const FirstSetup = () => {
  const { completeSetup } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await completeSetup(username, password)
      navigate('/recipes', { replace: true })
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
          <h1 className="text-2xl font-bold text-ink dark:text-white">First-time Setup</h1>
          <p className="text-sm text-muted mt-1 text-center">
            Replace the default admin credentials to secure your account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">New Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <KeyRound size={18} />
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default FirstSetup
