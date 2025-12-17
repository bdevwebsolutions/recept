import path from 'node:path'
import { serve, file as bunFile } from 'bun'
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

// Serve uploaded images directly using Bun.file for reliability
const uploadsDir = path.join(process.cwd(), 'uploads')
app.get('/uploads/:filename', async (c) => {
  const filename = c.req.param('filename')
  // Sanitize filename to prevent directory traversal
  const safeName = path.basename(filename)
  const filePath = path.join(uploadsDir, safeName)
  
  const file = bunFile(filePath)
  const exists = await file.exists()
  
  if (!exists) {
    return c.json({ message: 'Image not found' }, 404)
  }
  
  return new Response(file, {
    headers: {
      'Content-Type': file.type || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
})

const distPath = path.resolve(process.cwd(), 'dist')
app.use('/assets/*', serveStatic({ root: distPath }))
app.get('*', serveStatic({ root: distPath, path: 'index.html' }))

const port = Number(process.env.PORT || 3000)
serve({
  fetch: app.fetch,
  port,
})

console.log(`Server running on http://localhost:${port}`)
