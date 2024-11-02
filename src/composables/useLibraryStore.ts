import {ref} from 'vue'
import {defineStore} from 'pinia'
import * as mangaService from '@/services/mangaService'
import {groupBy} from '@/utils/array'
import type Manga from '@/models/Manga'

export const useLibraryStore = defineStore('library', () => {
    const mangas = ref<Record<string, Manga[]>>({})
    const loading = ref(false)

    async function fetchLibrary() {
        loading.value = true
        const list = await mangaService.list()
        mangas.value = groupBy(list, 'source')
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