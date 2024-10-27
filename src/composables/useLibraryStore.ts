import {defineStore} from 'pinia'
import {ref} from 'vue'
import {list} from '@/services/mangaService'
import type Manga from '@/models/Manga'

export const useLibraryStore = defineStore('library', () => {
    const mangas = ref<Manga[]>([])
    const loading = ref(false)

    async function fetchLibrary() {
        loading.value = true
        mangas.value = await list()
        loading.value = false
    }

    return {
        mangas,
        loading,
        fetchLibrary,
    }
})