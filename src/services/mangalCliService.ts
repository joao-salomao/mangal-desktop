import {Command} from '@tauri-apps/plugin-shell'
import * as logger from '@/services/logService'
import {resolveResource} from '@tauri-apps/api/path'
import type {SpawnOptions} from '@tauri-apps/plugin-shell'
import {invoke} from '@tauri-apps/api/core'

export async function download(title: string, source: string, chapterIndex: number, downloadFolder: string): Promise<string> {
    return await runCommand({
        args: ['inline', '--source', source, '--query', title, '--manga', 'exact', '--chapters', chapterIndex.toString(), '--format', 'pdf', '--download'],
        options: {cwd: downloadFolder}
    })
}

export async function search(search: string, source: string): Promise<QueryResult> {
    const output = await runCommand({
        args: ['inline', '--fetch-metadata', '--include-anilist-manga', '--source', source, '--query', search, '-j']
    })
    return JSON.parse(output) as unknown as QueryResult
}

export async function getChaptersAvailableToDownload(title: string, source: string): Promise<number> {
    const output = await runCommand({
        args: ['inline', '--source', source, '--manga', 'exact', '--query', title, '--chapters', 'all', '-j']
    })

    const queryResult = JSON.parse(output) as unknown as QueryResult
    return queryResult.result[0]?.mangal?.chapters?.length ?? 0
}

export async function getAvailableSources(): Promise<string[]> {
    const result = await invoke<string[]>('get_available_sources')
    logger.info('Available sources', result)
    return result
}

async function runCommand(params: {
    args: string[];
    options?: SpawnOptions;
    sync?: boolean;
}): Promise<string> {
    const mangalConfigPath = await resolveResource('assets/mangal')

    const command = Command.sidecar('binaries/mangal-cli', params.args, {
        ...params.options ?? {},
        env: {MANGAL_CONFIG_PATH: mangalConfigPath}
    })

    if (params.sync) {
        const childProcess = await command.execute()
        return childProcess.stdout
    }

    await command.spawn()

    return new Promise((resolve, reject) => {
        const argsToLog = 'mangal-cli ' + params.args.join(' ')

        // It resolves the promise when it receives the first data event because the search command outputs the result in a single line
        // which is the first data event. We could also resolve the promise when the command ends but sometimes the close event is emitted
        // before the last data event is emitted which causes the promise to resolve with an incomplete result. This was specifically
        // tested with the sources list command, that's the reason why it is the only command that has the async flag set to true.
        command.stdout.on('data', (data) => {
            logger.info('Successfully run command ' + argsToLog, data)
            resolve(data)
        })

        command.on('error', (err) => {
            logger.error('Error running command ' + argsToLog, err)
            reject(new Error(err))
        })
    })
}

export interface MangaMetadata {
    genres: string[]
    summary: string
    staff: {
        story: string[];
        art: string[];
        translation: string[];
        lettering: string[];
    }
    cover: {
        extraLarge: string;
        large: string;
        medium: string;
        color: string;
    }
    bannerImage: string
    tags: string[]
    characters: string[]
    status: string
    startDate: {
        year: number;
        month: number;
        day: number;
    }
    endDate: {
        year: number;
        month: number;
        day: number;
    }
    synonyms: string[]
    chapters: number
    urls: string[]
}

export interface MangaSource {
    name: string;
    url: string;
    index: number;
    id: string;
    chapters?: any[];
    metadata: MangaMetadata;
}

export interface AniListCharacter {
    name: {
        full: string;
        native: string;
    };
}

export interface AniListStaff {
    role: string;
    node: {
        name: {
            full: string;
        };
    };
}

export interface AniListTag {
    name: string;
    description: string;
    rank: number;
}

export interface AniListTitle {
    romaji: string;
    english: string;
    native: string;
}

export interface AniListCoverImage {
    extraLarge: string;
    large: string;
    medium: string;
    color: string;
}

export interface AniListStartDate {
    year: number;
    month: number;
    day: number;
}

export interface AniList {
    title: AniListTitle;
    id: number;
    description: string;
    coverImage: AniListCoverImage;
    bannerImage: string;
    tags: AniListTag[];
    genres: string[];
    characters: {
        nodes: AniListCharacter[];
    };
    staff: {
        edges: AniListStaff[];
    };
    startDate: AniListStartDate;
    endDate: AniListStartDate;
    synonyms: string[];
    status: string;
    idMal: number;
    chapters: number;
    siteUrl: string;
    countryOfOrigin: string;
    externalLinks: string[];
}

export interface Result {
    source: string;
    mangal: MangaSource;
    anilist?: AniList;
}

export interface QueryResult {
    query: string;
    result: Result[];
}
