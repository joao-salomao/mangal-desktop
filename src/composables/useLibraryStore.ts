import {ref} from 'vue'
import {defineStore} from 'pinia'
import * as mangaService from '@/services/mangaService'
import type Manga from '@/models/Manga'

export const useLibraryStore = defineStore('library', () => {
    const mangas = ref<Manga[]>([])
    const loading = ref(false)

    async function fetchLibrary() {
        loading.value = true
        mangas.value = await mangaService.list()
        loading.value = false
    }

    async function addToLibrary(manga: Manga) {
        await mangaService.addToLibrary(manga)
        fetchLibrary()
    }

    async function removeFromLibrary(manga: Manga) {
        await mangaService.removeFromLibrary(manga)
        fetchLibrary()
    }

    return {
        mangas,
        loading,
        fetchLibrary,
        addToLibrary,
        removeFromLibrary
    }
})