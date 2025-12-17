import bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'
import {
  AppEnv,
  authMiddleware,
  requiresSetup as checkRequiresSetup,
} from '../middleware/auth'
import {
  createSession,
  deleteSession,
  deleteSessionsForUser,
  getSetting,
  getUserByUsername,
  setSetting,
  updateUserCredentials,
} from '../db/schema'

const SESSION_DAYS = 7

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

const setupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const secureCookie = process.env.COOKIE_SECURE === 'true'

const setSessionCookie = (c: Hono.Context<AppEnv>, token: string) => {
  setCookie(c, 'session', token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: secureCookie,
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

const authRouter = new Hono<AppEnv>()

authRouter.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ message: parsed.error.errors[0].message }, 400)
  }

  const { username, password } = parsed.data
  const user = getUserByUsername(username)
  if (!user) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash)
  if (!passwordOk) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  const token = crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  createSession(user.id, token, expiresAt)
  setSessionCookie(c, token)

  const requiresSetup = checkRequiresSetup()
  return c.json({
    user: { id: user.id, username: user.username, isAdmin: Boolean(user.is_admin) },
    requiresSetup,
  })
})

authRouter.use('*', authMiddleware)

authRouter.post('/logout', (c) => {
  const token = getCookie(c, 'session')
  if (token) {
    deleteSession(token)
  }
  deleteCookie(c, 'session', { path: '/' })
  return c.json({ success: true })
})

authRouter.get('/me', (c) => {
  const user = c.get('user')!
  const requiresSetup = checkRequiresSetup()
  return c.json({ user, requiresSetup })
})

authRouter.post('/setup', async (c) => {
  const user = c.get('user')!
  if (!checkRequiresSetup()) {
    return c.json({ message: 'Setup already completed' }, 400)
  }

  const body = await c.req.json().catch(() => ({}))
  const parsed = setupSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ message: parsed.error.errors[0].message }, 400)
  }

  updateUserCredentials(user.id, parsed.data.username, parsed.data.password)
  setSetting('setup_complete', 'true')

  // Drop previous sessions and rotate cookie
  deleteSessionsForUser(user.id)
  const token = crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  createSession(user.id, token, expiresAt)
  setSessionCookie(c, token)

  return c.json({
    user: { id: user.id, username: parsed.data.username, isAdmin: true },
    requiresSetup: false,
  })
})

export { authRouter }

