import { FormEvent, useEffect, useState } from 'react'
import { Shield, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react'

type User = {
  id: number
  username: string
  isAdmin: boolean
  createdAt: string
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', { credentials: 'include' })
      const data = await res.json()
      setUsers(data.users ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setAdding(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, isAdmin }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Could not create user')
      }
      setUsername('')
      setPassword('')
      setIsAdmin(false)
      loadUsers()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAdding(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' })
    loadUsers()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white flex items-center gap-3">
          <UsersIcon size={24} />
          User Management
        </h1>
        <p className="text-sm text-muted mt-1">Add or remove users who can access your recipes</p>
      </div>

      {/* Add user form */}
      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-ink dark:text-white flex items-center gap-2">
          <UserPlus size={20} />
          Add New User
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 h-[46px] cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span className="text-sm font-medium text-ink dark:text-white">Admin privileges</span>
            </label>
          </div>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={adding}>
          <UserPlus size={18} />
          {adding ? 'Adding...' : 'Add User'}
        </button>
      </form>

      {/* Users list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-ink dark:text-white">
            Existing Users ({users.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 skeleton rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-24 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-muted">No users yet</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-ink dark:text-white flex items-center gap-2">
                      {u.username}
                      {u.isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent">
                          <Shield size={10} />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">Joined {formatDate(u.createdAt)}</div>
                  </div>
                </div>
                <button
                  onClick={() => remove(u.id)}
                  className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  aria-label={`Delete ${u.username}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
