import {createStore} from '@tauri-apps/plugin-store'
import * as logger from '@tauri-apps/plugin-log'
import type {Store} from '@tauri-apps/plugin-store'

// TODO: check if this is the correct way to use the store or if we should always call
let store: Store | null = null

export async function get<T>(key: string): Promise<T | null> {
    logger.info(`KeyValueDatabase: Get value for key "${key}"`)
    const store = await getStore()
    return store.get<T>(key)
}


export async function set<T>(key: string, value: T): Promise<void> {
    logger.info(`KeyValueDatabase: Set value for key "${key}": ${value}`)
    const store = await getStore()
    await store.set(key, value)
}

async function getStore(): Promise<Store> {
    if (!store) {
        store = await createStore('store.bin', {
            autoSave: 1 as unknown as boolean,
        })
    }

    return store
}