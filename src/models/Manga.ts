import type {
    Result,
    AniListCharacter,
    AniListCoverImage,
    AniListStaff, AniListStartDate,
    AniListTag,
    AniListTitle
} from '@/services/MangalCliService.ts'

export default class Manga {
    id?: number
    title: string
    source: string
    createdAt?: Date
    updatedAt?: Date
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

    public constructor(params: {
        id?: number,
        title: string,
        source: string,
        metadata: Manga['metadata'],
        anilist?: Manga['anilist'],
        createdAt?: Date,
        updatedAt?: Date,
    }) {
        this.id = params.id ?? null
        this.title = params.title
        this.source = params.source
        this.metadata = params.metadata
        this.createdAt = params.createdAt ?? null
        this.updatedAt = params.updatedAt ?? null
    }

    public static fromDatabaseRow(row: object): Manga {
        return new Manga({
            id: row.id,
            title: row.title,
            source: row.source,
            metadata: JSON.parse(row.metadata),
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        })
    }

    public static fromMangalCliResult(result: Result): Manga {
        return new Manga({
            title: result.mangal.name,
            source: result.source,
            anilist: result.anilist,
            metadata: result.mangal.metadata
        })
    }
}