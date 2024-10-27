import {createStore} from '@tauri-apps/plugin-store'
import * as logger from '@tauri-apps/plugin-log'
import type {Store} from '@tauri-apps/plugin-store'

export default class KeyValueDatabase {
    private static instance: KeyValueDatabase

    private store: Store | null = null

    private constructor() {
    }

    public static getInstance(): KeyValueDatabase {
        if (!KeyValueDatabase.instance) {
            KeyValueDatabase.instance = new KeyValueDatabase()
        }

        return KeyValueDatabase.instance
    }

    public async get<T>(key: string): Promise<T | null> {
        const store = await this.getStore()
        const value = await store.get<T>(key)
        await logger.info(`KeyValueDatabase: Got value for key "${key}": ${value}`)

        return value
    }

    public async set<T>(key: string, value: T): Promise<void> {
        const store = await this.getStore()
        await store.set(key, value)
        await logger.info(`KeyValueDatabase: Set value for key "${key}": ${value}`)
    }

    private async getStore(): Promise<Store> {
        if (!this.store) {
            this.store = await createStore('store.bin', {
                autoSave: 1 as unknown as boolean,
            })
        }

        return this.store
    }
}