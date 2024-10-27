import {get, set} from './keyValueDatabaseService'
import {open, message} from '@tauri-apps/plugin-dialog'

const DOWNLOAD_FOLDER_KEY: string = 'download_folder'

export async function updateDownloadFolder(): Promise<string | null> {
    const newPath = await open({multiple: false, directory: true})

    if (!newPath) {
        await message(`No folder selected.`, {title: 'Warning', kind: 'warning'})
        return null
    }

    set(DOWNLOAD_FOLDER_KEY, newPath)

    return getDownloadFolder()
}

export async function getDownloadFolder(): Promise<string | null> {
    return get<string>(DOWNLOAD_FOLDER_KEY)
}