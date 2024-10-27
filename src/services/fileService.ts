import {Command} from '@tauri-apps/plugin-shell'
import * as os from '@tauri-apps/plugin-os'
import type {Platform} from '@tauri-apps/plugin-os'

export async function openFileWithOSDefaultHandler(filePath: string): Promise<void> {
    const platform: Platform = await os.platform()
    const handlerByPlatform: Record<string, string> = {
        linux: 'xdg-open',
        macos: 'open',
        windows: 'start',
    }

    const handler = handlerByPlatform[platform] ?? null
    if (!handler) {
        throw new Error('Unsupported platform')
    }

    await Command.create(handler, filePath).execute()
}