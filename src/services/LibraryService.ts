import Manga from '@/models/Manga'
import Database from '@tauri-apps/plugin-sql'

export default class LibraryService {
    private static instance: LibraryService

    private constructor() {
    }

    public static getInstance(): LibraryService {
        if (!LibraryService.instance) {
            LibraryService.instance = new LibraryService()
        }

        return LibraryService.instance
    }

    public async search(source: string, search: string): Promise<Manga[]> {

    }

    public async list(): Promise<Manga[]> {
        const db = await this.getDatabase()
        const result: object[] = await db.select('SELECT * FROM mangas')

        return result.map((row) => {
            return new Manga({
                id: row['id'],
                title: row['title'],
                source: row['source'],
                metadata: JSON.parse(row['metadata']),
                createdAt: row['createdAt'],
                updatedAt: row['updatedAt'],
            })
        })
    }

    public async addMangaToLibrary(manga: Manga): Promise<number> {
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

    private getDatabase(): Promise<Database> {
        return Database.load('sqlite:database.bin')
    }
}