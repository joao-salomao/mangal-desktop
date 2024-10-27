import {Command} from '@tauri-apps/plugin-shell'

export default class FileService {
    private static instance: FileService | null = null

    private constructor() {
    }

    public static getInstance(): FileService {
        if (!FileService.instance) {
            FileService.instance = new FileService()
        }

        return FileService.instance
    }

    public async openFileWithDefaultHandler(filePath: string): Promise<void> {
        // TODO: This only works on Linux. Implement for other OSs.
        await Command.create('xdg-open', filePath).execute()
    }
}