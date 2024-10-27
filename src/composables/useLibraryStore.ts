import { defineStore } from 'pinia'
import {ref} from 'vue'
import type Manga from '@/models/Manga.ts'
import {MangaService} from '@/services/MangaService.ts'

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useLibraryStore = defineStore('library', () => {
    const mangas = ref<Manga[]>([])
    const loading = ref(false)

    async function fetchLibrary() {
        loading.value = true
        mangas.value = await MangaService.getInstance().list()
        loading.value = false
    }

    return {
        mangas,
        loading,
        fetchLibrary,
    }
})