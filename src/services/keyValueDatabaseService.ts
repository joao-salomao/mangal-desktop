import {Store} from '@tauri-apps/plugin-store'

// TODO: check if this is the correct way to use the store or if we should always call
let store: Store | null = null

/**
 * Enum for all the keys used in the store. This is used to avoid typos and to have a single place where all the keys are defined.
 */
export enum StoreKey {
    SEARCH_STORE_FORM = 'search_store.form',
    READER_SCALE = 'reader.scale',
    SETTINGS_DOWNLOAD_FOLDER = 'settings.download_folder',
}

export async function get<T>(key: StoreKey): Promise<T | null> {
    const store = await getStore()
    const value = await store.get<T | null | undefined>(key)
    return value ?? null
}

export async function set<T>(key: StoreKey, value: T): Promise<void> {
    const store = await getStore()
    await store.set(key, value)
}

export async function has(key: StoreKey): Promise<boolean> {
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