import {Command} from '@tauri-apps/plugin-shell'
import * as logger from '@/services/logService'
import type {SpawnOptions} from '@tauri-apps/plugin-shell'

export async function download(title: string, source: string, chapterIndex: number, downloadFolder: string): Promise<string> {
    const args = ['inline', '--source', source, '--query', title, '--manga', 'exact', '--chapters', chapterIndex.toString(), '--format', 'pdf', '--download']
    return await runCommand(args, {cwd: downloadFolder})
}

export async function search(search: string, source: string): Promise<QueryResult> {
    await logger.info('MangalCliService| Searching for manga: ' + search + ' on ' + source)

    const args = ['inline', '--fetch-metadata', '--include-anilist-manga', '--source', source, '--query', search, '-j']
    const output = await runCommand(args)

    return JSON.parse(output) as unknown as QueryResult
}

async function runCommand(args: string | string[], options: SpawnOptions = {}): Promise<string> {
    const command = Command.sidecar('binaries/mangal-cli', args, options)
    await command.spawn()

    return new Promise((resolve, reject) => {
        command.stdout.on('data', (data) => {
            logger.info('Command successfully executed:', args, data)
            resolve(data)
        })

        command.stderr.on('data', (data) => {
            logger.error('Error while executing command:', args, data)
            reject(data)
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
    chapters: any[];
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
    anilist: AniList;
}

export interface QueryResult {
    query: string;
    result: Result[];
}
