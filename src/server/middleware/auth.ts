import type { Context, Next } from 'hono'
import { deleteCookie, getCookie } from 'hono/cookie'
import { deleteSession, getSessionWithUser, removeExpiredSessions, getSetting } from '../db/schema'

export type AuthUser = {
  id: number
  username: string
  isAdmin: boolean
}

export type AppEnv = {
  Variables: {
    user?: AuthUser
  }
}

export const authMiddleware = async (c: Context<AppEnv>, next: Next) => {
  const token = getCookie(c, 'session')
  if (!token) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  removeExpiredSessions()
  const session = getSessionWithUser(token)
  if (!session) {
    deleteCookie(c, 'session', { path: '/' })
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const isExpired = new Date(session.expires_at).getTime() <= Date.now()
  if (isExpired) {
    deleteSession(token)
    deleteCookie(c, 'session', { path: '/' })
    return c.json({ message: 'Session expired' }, 401)
  }

  c.set('user', {
    id: session.user_id,
    username: session.username,
    isAdmin: Boolean(session.is_admin),
  })

  return next()
}

export const adminOnly = async (c: Context<AppEnv>, next: Next) => {
  const user = c.get('user')
  if (!user?.isAdmin) {
    return c.json({ message: 'Forbidden' }, 403)
  }
  return next()
}

export const requiresSetup = () => getSetting('setup_complete') !== 'true'

