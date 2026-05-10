import { drizzle } from 'drizzle-orm/node-postgres'
import { sql as drizzleSql } from 'drizzle-orm'
import { Pool } from 'pg'
import * as schema from './schema'

declare global {
  var planPool: Pool | undefined
}

function createPool() {
  const connectionString = process.env.DATABASE_URL

  return new Pool({
    connectionString: connectionString ?? 'postgres://missing:missing@127.0.0.1:1/missing',
    max: 10,
    connectionTimeoutMillis: 3000,
  })
}

export const pool = globalThis.planPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalThis.planPool = pool
}

export const db = drizzle(pool, { schema })
export const sql = drizzleSql
