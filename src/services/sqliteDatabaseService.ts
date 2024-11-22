import Database from '@tauri-apps/plugin-sql'
import type {QueryResult} from '@tauri-apps/plugin-sql'

type SelectQueryResult = Array<{ [key: string]: any }>

/**
 * Execute statements on the database
 * @param query
 * @param bindValues
 */
export async function execute(query: string, bindValues?: unknown[]): Promise<QueryResult> {
    return runAndCloseDatabase<QueryResult>(async (db: Database) => db.execute(query, bindValues))
}

/**
 * Run select query on the database and return the result
 * @param query
 * @param bindValues
 */
export async function select(query: string, bindValues?: unknown[]): Promise<SelectQueryResult> {
    return runAndCloseDatabase<SelectQueryResult>(async (db: Database) => db.select(query, bindValues))
}

/**
 * Find a single row in the database
 * @param q
 * @param bindValues
 */
export async function find(q: string, bindValues?: unknown[]): Promise<SelectQueryResult[0] | null> {
    const result = await select(q, bindValues)
    return result[0] ?? null
}


async function runAndCloseDatabase<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    const db = await Database.load('sqlite:database.bin')
    const result = await callback(db)
    await db.close()
    return result
}