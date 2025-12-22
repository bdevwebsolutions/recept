import { Hono } from 'hono'
import { z } from 'zod'
import { adminOnly, AppEnv, authMiddleware } from '../middleware/auth'
import { createUser, db, deleteUserById, getUserById, getUserByUsername } from '../db/schema'

const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  isAdmin: z.boolean().default(false),
})

const usersRouter = new Hono<AppEnv>()
usersRouter.use('*', authMiddleware)
usersRouter.use('*', adminOnly)

usersRouter.get('/', (c) => {
  const users = db
    .query('SELECT id, username, is_admin as isAdmin, created_at as createdAt FROM users ORDER BY created_at DESC')
    .all()

  return c.json({ users })
})

usersRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ message: parsed.error.errors[0].message }, 400)
  }

  const existing = getUserByUsername(parsed.data.username)
  if (existing) {
    return c.json({ message: 'Username already exists' }, 400)
  }

  const user = createUser(parsed.data.username, parsed.data.password, parsed.data.isAdmin)
  return c.json({ user: { id: user.id, username: user.username, isAdmin: Boolean(user.is_admin) } })
})

usersRouter.delete('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const found = getUserById(id)
  if (!found) {
    return c.json({ message: 'Not found' }, 404)
  }

  deleteUserById(id)
  return c.json({ success: true })
})

export { usersRouter }




