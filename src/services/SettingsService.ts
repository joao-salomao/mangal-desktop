import KeyValueDatabase from './KeyValueDatabase'
import {open, message} from '@tauri-apps/plugin-dialog'

const DOWNLOAD_FOLDER_KEY: string = 'download_folder'

export default class SettingsService {
    private static instance: SettingsService | null = null

    private constructor() {
    }

    public static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService()
        }

        return SettingsService.instance
    }

    public async updateDownloadFolder(): Promise<string | null> {
        const newPath = await open({multiple: false, directory: true})

        if (!newPath) {
            await message(`No folder selected.`, {title: 'Warning', kind: 'warning'})
            return
        }

        await KeyValueDatabase.getInstance().set(DOWNLOAD_FOLDER_KEY, newPath)

        return this.getDownloadFolder()
    }

    public async getDownloadFolder(): Promise<string | null> {
        return KeyValueDatabase.getInstance().get<string>(DOWNLOAD_FOLDER_KEY)
    }
}