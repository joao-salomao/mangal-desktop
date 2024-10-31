import * as logger from '@tauri-apps/plugin-log'
import {Store} from '@tauri-apps/plugin-store'

// TODO: check if this is the correct way to use the store or if we should always call
let store: Store | null = null

export async function get<T>(key: string): Promise<T | null> {
    logger.info(`KeyValueDatabase: Get value for key "${key}"`)
    const store = await getStore()
    const value = await store.get<T | null | undefined>(key)
    return value ?? null
}


export async function set<T>(key: string, value: T): Promise<void> {
    logger.info(`KeyValueDatabase: Set value for key "${key}": ${value}`)
    const store = await getStore()
    await store.set(key, value)
}

async function getStore(): Promise<Store> {
    if (!store) {
        store = await Store.load('store.json', {
            autoSave: true,
        })
    }

    return store
}