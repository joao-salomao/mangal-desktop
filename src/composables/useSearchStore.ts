import {ref} from 'vue'
import {defineStore} from 'pinia'
import {MangaService} from '@/services/MangaService.ts'
import LogService from '@/services/LogService.ts'
import type Manga from '@/models/Manga.ts'

export const useSearchStore = defineStore('search', () => {
    const logger = LogService.getInstance()
    const loading = ref(false)
    const form = ref({
        source: 'Mangapill',
        search: 'Solanin'
    })

    const mangas = ref<Manga[]>([])

    async function search() {
        try {
            loading.value = true
            mangas.value = await MangaService.getInstance().search(form.value.search, form.value.source)
        } catch (e: any) {
            await logger.error('Error while searching' + e)
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        form,
        mangas,
        search
    }
})