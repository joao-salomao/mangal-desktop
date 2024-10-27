export default class DownloadedChapter {
    id: number
    mangaId: number
    chapter: string
    path: string
    createdAt: string
    lastDownloadedAt: string

    public constructor(params: {
        id: number,
        mangaId: number,
        chapter: string,
        path: string,
        createdAt: string,
        lastDownloadedAt: string,
    }) {
        this.id = params.id
        this.mangaId = params.mangaId
        this.chapter = params.chapter
        this.path = params.path
        this.createdAt = params.createdAt
        this.lastDownloadedAt = params.lastDownloadedAt
    }


    public static fromDatabaseRow(row: { [key: string]: any }): DownloadedChapter {
        return new DownloadedChapter({
            id: row.id,
            mangaId: row.mangaId,
            chapter: row.chapter,
            path: row.path,
            createdAt: row.createdAt,
            lastDownloadedAt: row.lastDownloadedAt,
        })
    }
}