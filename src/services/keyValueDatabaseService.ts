import {createStore} from '@tauri-apps/plugin-store'
import * as logger from '@tauri-apps/plugin-log'
import type {Store} from '@tauri-apps/plugin-store'

// TODO: check if this is the correct way to use the store or if we should always call
let store: Store | null = null

async function getStore(): Promise<Store> {
    if (!store) {
        store = await createStore('store.bin', {
            autoSave: 1 as unknown as boolean,
        })
    }

    return store
}

export async function get<T>(key: string): Promise<T | null> {
    const store = await getStore()
    const value = await store.get<T>(key)
    await logger.info(`KeyValueDatabase: Got value for key "${key}": ${value}`)
    return value
}


export async function set<T>(key: string, value: T): Promise<void> {
    const store = await getStore()
    await store.set(key, value)
    await logger.info(`KeyValueDatabase: Set value for key "${key}": ${value}`)
}