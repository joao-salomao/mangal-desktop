import MangalCliService from '@/services/MangalCliService.ts'
import Manga from '@/models/Manga'
import Database from '@tauri-apps/plugin-sql'
import {MangaNotInLibraryError, DownloadFolderNotSetError} from '@/errors'
import SettingsService from '@/services/SettingsService'
import {pluck, chunk} from '@/utils/array'
import DownloadedChapter from '@/models/DownloadedChapter'

export class MangaService {
    private static instance: MangaService
    private mangalCliService: MangalCliService = MangalCliService.getInstance()
    private settingsService: SettingsService = SettingsService.getInstance()

    private constructor() {
    }

    public static getInstance(): MangaService {
        if (!MangaService.instance) {
            MangaService.instance = new MangaService()
        }

        return MangaService.instance
    }

    public async download(manga: Manga, chapter: number): Promise<void> {
        if (!manga.id) {
            throw new MangaNotInLibraryError()
        }

        const mangaFromLibrary = await this.findWhere([{field: 'id', operator: '=', value: manga.id}])
        if (!mangaFromLibrary) {
            throw new MangaNotInLibraryError()
        }

        const downloadFolder: string | null = await this.settingsService.getDownloadFolder()
        if (!downloadFolder) {
            throw new DownloadFolderNotSetError()
        }

        // TODO: if the chapter is already downloaded, don't create a new entry in the database. Use the existing one.

        const chapterIndex = chapter - 1
        const filePath = await this.mangalCliService.download(mangaFromLibrary.title, mangaFromLibrary.source, chapterIndex, downloadFolder)

        const db = await this.getDatabase()
        await db.execute(
            'INSERT INTO downloaded_chapters(mangaId, chapter, path, lastDownloadedAt, createdAt) VALUES($1, $2, $3, $4, $5)',
            [mangaFromLibrary.id, chapter, filePath.trim(), new Date().toISOString(), new Date().toISOString()],
        )
    }

    /**
     * Search for a manga using the Mangal CLI by title and source
     */
    public async search(title: string, source: string): Promise<Manga[]> {
        const queryResult = await this.mangalCliService.search(title, source)
        return queryResult.result.map(Manga.fromMangalCliResult)
    }

    /**
     * List all mangas in the user library
     */
    public async list(): Promise<Manga[]> {
        const db = await this.getDatabase()
        const result: Array<{ [key: string]: any }> = await db.select('SELECT * FROM mangas')

        const downloadedChaptersPromises = chunk(pluck(result, 'id'), 500).map((ids: number[]) => {
            return db.select(`SELECT *
                              FROM downloaded_chapters
                              WHERE mangaId IN (${ids.join(',')})`)
        })

        const downloadedChapters = (await Promise.all(downloadedChaptersPromises)).flat() as Array<{
            [key: string]: any
        }>

        const downloadedChaptersByMangaId: Record<number, DownloadedChapter[]> = downloadedChapters
            .reduce((acc: Record<number, DownloadedChapter[]>, chapter: { [key: string]: any }) => {
                if (!acc[chapter.mangaId]) {
                    acc[chapter.mangaId] = []
                }

                acc[chapter.mangaId].push(DownloadedChapter.fromDatabaseRow(chapter))

                return acc
            }, {})

        return result.map((row: { [key: string]: any }) => {
            const manga = Manga.fromDatabaseRow(row)
            manga.downloadedChapters = downloadedChaptersByMangaId[manga.id!] ?? []
            return manga
        })
    }

    /**
     * Adds a manga to the library by inserting it into the database
     */
    public async addToLibrary(manga: Manga): Promise<number> {
        const db = await this.getDatabase()
        const result = await db.execute(
            'INSERT INTO mangas(title, source, metadata, createdAt, updatedAt) VALUES($1, $2, $3, $4, $5)',
            [
                manga.title,
                manga.source,
                JSON.stringify(manga.metadata),
                new Date().toISOString(),
                new Date().toISOString(),
            ],
        )

        return result.lastInsertId
    }

    /**
     * Find a manga by a specific field in the user library
     */
    private async findWhere(wheres: Array<{
        field: string,
        operator: string,
        value: string | number
    }>): Promise<Manga | null> {
        const values: Array<string | number> = []
        const fields: string[] = []

        for (const where of wheres) {
            fields.push(`${where.field} ${where.operator} $${fields.length + 1}`)
            values.push(where.value)
        }

        const db = await this.getDatabase()
        const row: object[] = await db.select(`SELECT *
                                               FROM mangas
                                               WHERE ${fields.join(' AND ')} LIMIT 1`, values)

        return row && row.length ? Manga.fromDatabaseRow(row[0]) : null
    }

    private getDatabase(): Promise<Database> {
        return Database.load('sqlite:database.bin')
    }
}