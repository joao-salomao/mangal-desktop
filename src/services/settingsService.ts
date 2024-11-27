import {get, set, StoreKey} from './keyValueDatabaseService'
import {open} from '@tauri-apps/plugin-dialog'

export async function updateDownloadFolder(): Promise<string | null> {
    const newPath = await open({multiple: false, directory: true})

    if (!newPath) {
        return null
    }

    await set(StoreKey.SETTINGS_DOWNLOAD_FOLDER, newPath)

    return getDownloadFolder()
}

export async function getDownloadFolder(): Promise<string | null> {
    return get<string>(StoreKey.SETTINGS_DOWNLOAD_FOLDER)
}

export async function isDownloadFolderSet(): Promise<boolean> {
    return (await getDownloadFolder()) !== null
}

export async function clearStoredDownloadFolder(): Promise<void> {
    await set(StoreKey.SETTINGS_DOWNLOAD_FOLDER, null)
}