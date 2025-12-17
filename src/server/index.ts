import path from 'node:path'
import { serve } from 'bun'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { authRouter } from './routes/auth'
import { recipesRouter } from './routes/recipes'
import { usersRouter } from './routes/users'
import { initDb } from './db/schema'

initDb()

const app = new Hono()

app.use('*', logger())

app.route('/api/auth', authRouter)
app.route('/api/recipes', recipesRouter)
app.route('/api/users', usersRouter)

// Serve uploaded images - use process.cwd() as root so /uploads/file.jpg resolves correctly
app.use('/uploads/*', serveStatic({ root: process.cwd() }))

const distPath = path.resolve(process.cwd(), 'dist')
app.use('/assets/*', serveStatic({ root: distPath }))
app.get('*', serveStatic({ root: distPath, path: 'index.html' }))

const port = Number(process.env.PORT || 3000)
serve({
  fetch: app.fetch,
  port,
})

console.log(`Server running on http://localhost:${port}`)
