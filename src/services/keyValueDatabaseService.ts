import {Store} from '@tauri-apps/plugin-store'

// TODO: check if this is the correct way to use the store or if we should always call
let store: Store | null = null

export async function get<T>(key: string): Promise<T | null> {
    const store = await getStore()
    const value = await store.get<T | null | undefined>(key)
    return value ?? null
}

export async function set<T>(key: string, value: T): Promise<void> {
    const store = await getStore()
    await store.set(key, value)
}

export async function has(key: string): Promise<boolean> {
    const store = await getStore()
    return store.has(key)
}

async function getStore(): Promise<Store> {
    if (!store) {
        store = await Store.load('store.json', {
            autoSave: true,
        })
    }

    return store
}