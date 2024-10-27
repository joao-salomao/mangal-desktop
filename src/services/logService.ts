import * as logger from '@tauri-apps/plugin-log'

type ContentType = Array<string | number | object>

export async function info(...content: ContentType): Promise<void> {
    await logger.info(formatMessage(...content))
}

export async function warning(...content: ContentType): Promise<void> {
    await logger.warn(formatMessage(...content))
}

export async function error(...content: ContentType): Promise<void> {
    await logger.error(formatMessage(...content))
}

function formatMessage(...content: ContentType): string {
    return content.map((part) => {
        if (typeof part === 'object') {
            return JSON.stringify(part)
        }

        return part
    }).join(' ')
}
