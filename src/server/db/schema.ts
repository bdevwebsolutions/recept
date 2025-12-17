import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'

export type UserRecord = {
  id: number
  username: string
  password_hash: string
  is_admin: number
  created_at: string
}

export type SessionRecord = {
  id: number
  user_id: number
  token: string
  expires_at: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = path.join(DATA_DIR, 'app.db')
export const db = new Database(DB_PATH, { create: true })

db.exec('PRAGMA foreign_keys = ON;')

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_path TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  const hasSetupFlag = getSetting('setup_complete')
  if (!hasSetupFlag) {
    setSetting('setup_complete', 'false')
  }

  const userExists = db.query<{ id: number }>('SELECT id FROM users LIMIT 1').get()
  if (!userExists) {
    createDefaultAdmin()
  }
}

export const getSetting = (key: string): string | undefined => {
  const row = db.query<{ value: string }>('SELECT value FROM app_settings WHERE key = ?').get(key)
  return row?.value
}

export const setSetting = (key: string, value: string) => {
  db.query(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value)
}

const createDefaultAdmin = () => {
  const hash = bcrypt.hashSync('admin', 10)
  db.query('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)').run('admin', hash)
}

export const getUserByUsername = (username: string) => {
  return db.query<UserRecord>('SELECT * FROM users WHERE username = ?').get(username)
}

export const getUserById = (id: number) => {
  return db.query<UserRecord>('SELECT * FROM users WHERE id = ?').get(id)
}

export const createUser = (username: string, password: string, isAdmin: boolean) => {
  const hash = bcrypt.hashSync(password, 10)
  db.query('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)').run(
    username,
    hash,
    isAdmin ? 1 : 0
  )
  return getUserByUsername(username)!
}

export const updateUserCredentials = (id: number, username: string, password: string) => {
  const hash = bcrypt.hashSync(password, 10)
  db.query('UPDATE users SET username = ?, password_hash = ? WHERE id = ?').run(username, hash, id)
}

export const deleteUserById = (id: number) => {
  db.query('DELETE FROM users WHERE id = ?').run(id)
}

export const removeExpiredSessions = () => {
  db.query('DELETE FROM sessions WHERE datetime(expires_at) <= datetime("now")').run()
}

export const createSession = (userId: number, token: string, expiresAt: string) => {
  db.query('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, token, expiresAt)
}

export const getSessionWithUser = (token: string) => {
  return db
    .query<{
      session_id: number
      token: string
      expires_at: string
      user_id: number
      username: string
      is_admin: number
    }>(
      `
      SELECT s.id as session_id, s.token, s.expires_at, u.id as user_id, u.username, u.is_admin
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
    `
    )
    .get(token)
}

export const deleteSession = (token: string) => {
  db.query('DELETE FROM sessions WHERE token = ?').run(token)
}

export const deleteSessionsForUser = (userId: number) => {
  db.query('DELETE FROM sessions WHERE user_id = ?').run(userId)
}

