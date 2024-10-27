import * as logger from '@tauri-apps/plugin-log'

type ContentType = Array<string | number | object>

export default class LogService {
    private static instance: LogService | null = null

    private constructor() {
    }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService()
        }

        return LogService.instance
    }

    public async info(...content: ContentType): Promise<void> {
        await logger.info(this.formatMessage(...content))
    }

    public async warning(...content: ContentType): Promise<void> {
        await logger.warn(this.formatMessage(...content))
    }

    public async error(...content: ContentType): Promise<void> {
        await logger.error(this.formatMessage(...content))
    }

    private formatMessage(...content: ContentType): string {
        return content.map((part) => {
            if (typeof part === 'object') {
                return JSON.stringify(part)
            }

            return part
        }).join(' ')
    }
}