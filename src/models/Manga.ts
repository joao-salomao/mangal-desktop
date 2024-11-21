import type { Result } from '@/services/mangalCliService'
import DownloadedChapter from '@/models/DownloadedChapter.ts'

export default class Manga {
    id?: number
    title: string
    source: string
    createdAt?: string
    updatedAt?: string
    chaptersAvailableToDownload: number
    metadata: {
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

    anilist?: {
        siteUrl?: string;
    }

    downloadedChapters?: Array<DownloadedChapter>

    // States for the UI
    $addingToLibrary?: boolean

    public constructor(params: {
        id?: number,
        title: string,
        source: string,
        metadata: Manga['metadata'],
        anilist?: Manga['anilist'],
        createdAt?: string,
        updatedAt?: string,
        chaptersAvailableToDownload?: number
    }) {
        this.id = params?.id
        this.title = params.title
        this.source = params.source
        this.metadata = params.metadata
        this.anilist = params.anilist
        this.createdAt = params.createdAt
        this.updatedAt = params.updatedAt
        this.chaptersAvailableToDownload = params.chaptersAvailableToDownload ?? 0
    }

    public static fromDatabaseRow(row: { [key: string]: any }): Manga {
        return new Manga({
            id: row.id,
            title: row.title,
            source: row.source,
            metadata: JSON.parse(row.metadata),
            anilist: row.anilist ? JSON.parse(row.anilist) : undefined,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            chaptersAvailableToDownload: row.chaptersAvailableToDownload
        })
    }

    public static fromMangalCliResult(result: Result): Manga {
        return new Manga({
            title: result.mangal.name,
            source: result.source,
            anilist: {siteUrl: result.anilist?.siteUrl},
            metadata: result.mangal.metadata,
            chaptersAvailableToDownload: result.mangal.chapters?.length ?? 0
        })
    }
}