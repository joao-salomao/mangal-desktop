import {get, set} from './keyValueDatabaseService'
import {open} from '@tauri-apps/plugin-dialog'

const DOWNLOAD_FOLDER_KEY: string = 'download_folder'

export async function updateDownloadFolder(): Promise<string | null> {
    const newPath = await open({multiple: false, directory: true})

    if (!newPath) {
        return null
    }

    await set(DOWNLOAD_FOLDER_KEY, newPath)

    return getDownloadFolder()
}

export async function getDownloadFolder(): Promise<string | null> {
    return get<string>(DOWNLOAD_FOLDER_KEY)
}

export async function isDownloadFolderSet(): Promise<boolean> {
    return (await getDownloadFolder()) !== null
}

export async function clearStoredDownloadFolder(): Promise<void> {
    await set(DOWNLOAD_FOLDER_KEY, null)
}