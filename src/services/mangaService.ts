import * as mangalCliService from '@/services/mangalCliService'
import Manga from '@/models/Manga'
import {MangaNotInLibraryError, DownloadFolderNotSetError} from '@/errors'
import {getDownloadFolder} from '@/services/settingsService'
import {pluck, chunk} from '@/utils/array'
import DownloadedChapter from '@/models/DownloadedChapter'
import * as db from '@/services/databaseService'

export async function download(manga: Manga, chapter: number): Promise<void> {
    if (!manga.id) {
        throw new MangaNotInLibraryError()
    }

    const mangaFromLibrary = await db.find('SELECT * FROM mangas WHERE id = $1', [manga.id])
    if (!mangaFromLibrary) {
        throw new MangaNotInLibraryError()
    }

    const downloadFolder: string | null = await getDownloadFolder()
    if (!downloadFolder) {
        throw new DownloadFolderNotSetError()
    }

    const filePath = await mangalCliService.download(mangaFromLibrary.title, mangaFromLibrary.source, chapter - 1, downloadFolder)

    const existingChapter = await db.select(
        'SELECT * FROM downloaded_chapters WHERE mangaId = $1 AND chapter = $2',
        [mangaFromLibrary.id, chapter]
    )

    if (existingChapter.length) {
        await db.execute(
            'UPDATE downloaded_chapters SET path = $1, lastDownloadedAt = $2 WHERE id = $3',
            [filePath.trim(), new Date().toISOString(), existingChapter[0].id],
        )
    } else {
        await db.execute(
            'INSERT INTO downloaded_chapters(mangaId, chapter, path, lastDownloadedAt, createdAt) VALUES($1, $2, $3, $4, $5)',
            [mangaFromLibrary.id, chapter, filePath.trim(), new Date().toISOString(), new Date().toISOString()],
        )
    }
}

/**
 * Search for a manga using the Mangal CLI by title and source
 */
export async function search(title: string, source: string): Promise<Manga[]> {
    const queryResult = await mangalCliService.search(title, source)
    return queryResult.result.map(Manga.fromMangalCliResult)
}


/**
 * List all mangas in the user library
 */
export async function list(): Promise<Manga[]> {
    const result = await db.select('SELECT * FROM mangas')

    const downloadedChaptersPromises = chunk(pluck(result, 'id'), 500).map((ids: number[]) => {
        return db.select(`SELECT *
                          FROM downloaded_chapters
                          WHERE mangaId IN (${ids.join(',')})`)
    })

    const downloadedChapters = (await Promise.all(downloadedChaptersPromises)).flat()

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
        manga.downloadedChapters = (downloadedChaptersByMangaId[manga.id!] ?? []).sort((a, b) => a.chapter - b.chapter)
        return manga
    })
}

/**
 * Adds a manga to the library by inserting it into the database
 */
export async function addToLibrary(manga: Manga): Promise<number> {
    const result = await db.execute(
        'INSERT INTO mangas(title, source, metadata, anilist, createdAt, updatedAt) VALUES($1, $2, $3, $4, $5, $6)',
        [
            manga.title,
            manga.source,
            JSON.stringify(manga.metadata),
            manga.anilist ? JSON.stringify(manga.anilist) : null,
            new Date().toISOString(),
            new Date().toISOString()
        ],
    )

    return result.lastInsertId
}

export async function removeFromLibrary(manga: Manga): Promise<void> {
    if (!manga.id) {
        throw new MangaNotInLibraryError()
    }

    await db.execute('DELETE FROM downloaded_chapters WHERE mangaId = $1', [manga.id])
    await db.execute('DELETE FROM mangas WHERE id = $1', [manga.id])
}