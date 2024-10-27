import {ref} from 'vue'
import {defineStore} from 'pinia'
import * as mangaService from '@/services/mangaService'
import * as logger from '@/services/logService'
import type Manga from '@/models/Manga'

export const useSearchStore = defineStore('search', () => {
    const loading = ref(false)
    const form = ref({
        source: 'Mangapill',
        search: 'Solanin'
    })

    const mangas = ref<Manga[]>([])

    async function search() {
        try {
            loading.value = true
            mangas.value = await mangaService.search(form.value.search, form.value.source)
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