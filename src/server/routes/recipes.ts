import { mkdirSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { Hono } from 'hono'
import { authMiddleware, AppEnv } from '../middleware/auth'
import { db } from '../db/schema'

const uploadDir = path.join(process.cwd(), 'uploads')
mkdirSync(uploadDir, { recursive: true })

const recipesRouter = new Hono<AppEnv>()
recipesRouter.use('*', authMiddleware)

recipesRouter.get('/', (c) => {
  const rows = db
    .query(
      `
      SELECT r.id,
             r.title,
             r.content,
             r.image_path,
             r.created_at,
             r.updated_at,
             u.username as author
      FROM recipes r
      LEFT JOIN users u ON u.id = r.created_by
      ORDER BY r.created_at DESC
    `
    )
    .all()

  return c.json({ recipes: rows })
})

recipesRouter.get('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const row = db
    .query(
      `
      SELECT r.id,
             r.title,
             r.content,
             r.image_path,
             r.created_at,
             r.updated_at,
             u.username as author
      FROM recipes r
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.id = ?
    `
    )
    .get(id)

  if (!row) {
    return c.json({ message: 'Not found' }, 404)
  }

  return c.json({ recipe: row })
})

const saveImage = async (file?: File) => {
  if (!file || !(file instanceof File) || file.size === 0) return null
  const ext = path.extname(file.name) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`
  const dest = path.join(uploadDir, filename)
  // Use arrayBuffer() instead of stream() for reliable file writing
  const buffer = await file.arrayBuffer()
  await Bun.write(dest, buffer)
  return `/uploads/${filename}`
}

recipesRouter.post('/', async (c) => {
  const body = await c.req.parseBody()
  const title = (body.title as string | undefined)?.trim()
  const content = (body.content as string | undefined)?.trim()
  if (!title || !content) {
    return c.json({ message: 'Title and content are required' }, 400)
  }

  const imagePath = await saveImage(body.image as File | undefined)
  const user = c.get('user')!

  db.query(
    'INSERT INTO recipes (title, content, image_path, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
  ).run(title, content, imagePath, user.id)

  return c.json({ success: true })
})

recipesRouter.put('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const current = db.query<{ image_path: string | null }>('SELECT image_path FROM recipes WHERE id = ?').get(id)
  if (!current) {
    return c.json({ message: 'Not found' }, 404)
  }

  const body = await c.req.parseBody()
  const title = (body.title as string | undefined)?.trim() ?? null
  const content = (body.content as string | undefined)?.trim() ?? null
  const newImage = (body.image as File | undefined) || null

  let imagePath = current.image_path
  if (newImage && newImage.size > 0) {
    // Remove old image if exists
    if (imagePath) {
      const oldPath = path.join(process.cwd(), imagePath.startsWith('/') ? imagePath.slice(1) : imagePath)
      try {
        unlinkSync(oldPath)
      } catch {
        // ignore missing files
      }
    }
    imagePath = await saveImage(newImage)
  }

  db.query(
    `
    UPDATE recipes
    SET title = COALESCE(?, title),
        content = COALESCE(?, content),
        image_path = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  ).run(title, content, imagePath, id)

  return c.json({ success: true })
})

recipesRouter.delete('/:id', (c) => {
  const id = Number(c.req.param('id'))
  const current = db.query<{ image_path: string | null }>('SELECT image_path FROM recipes WHERE id = ?').get(id)
  if (!current) {
    return c.json({ message: 'Not found' }, 404)
  }

  if (current.image_path) {
    const filePath = path.join(process.cwd(), current.image_path.startsWith('/') ? current.image_path.slice(1) : current.image_path)
    try {
      unlinkSync(filePath)
    } catch {
      // ignore missing file
    }
  }

  db.query('DELETE FROM recipes WHERE id = ?').run(id)
  return c.json({ success: true })
})

export { recipesRouter }
