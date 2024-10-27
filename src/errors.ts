export class DownloadFolderNotSetError extends Error {
    constructor() {
        super('The download folder is not set')
    }
}

export class MangaNotInLibraryError extends Error {
    constructor() {
        super('The manga must be in the library to download it')
    }
}