import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type User = {
  id: number
  username: string
  isAdmin: boolean
}

type AuthContextValue = {
  user?: User
  requiresSetup: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  completeSetup: (username: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const parseError = async (response: Response) => {
  try {
    const data = await response.json()
    return data?.message || 'Request failed'
  } catch {
    return 'Request failed'
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>()
  const [requiresSetup, setRequiresSetup] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) {
        setUser(undefined)
        setRequiresSetup(false)
        return
      }
      const data = await res.json()
      setUser(data.user)
      setRequiresSetup(Boolean(data.requiresSetup))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      throw new Error(await parseError(res))
    }

    const data = await res.json()
    setUser(data.user)
    setRequiresSetup(Boolean(data.requiresSetup))
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(undefined)
    setRequiresSetup(false)
  }

  const completeSetup = async (username: string, password: string) => {
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      throw new Error(await parseError(res))
    }

    const data = await res.json()
    setUser(data.user)
    setRequiresSetup(false)
  }

  return (
    <AuthContext.Provider value={{ user, requiresSetup, loading, login, logout, refresh, completeSetup }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

