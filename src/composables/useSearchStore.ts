import {ref} from 'vue'
import {defineStore} from 'pinia'
import * as mangaService from '@/services/mangaService'
import * as logger from '@/services/logService'
import type Manga from '@/models/Manga'
import {useToast} from 'primevue/usetoast'

export const useSearchStore = defineStore('search', () => {
    const loading = ref(false)
    const form = ref({
        sources: ['Mangapill'],
        search: ''
    })

    const mangas = ref<Record<string, Manga[]>>({})

    const toast = useToast()

    async function search() {
        try {
            loading.value = true
            mangas.value = {}

            const promises = form.value.sources.map((source: string) => {
                mangas.value[source] = []

                return mangaService.search(form.value.search, source)
                    .then(result => {
                        mangas.value = {
                            ...mangas.value,
                            [source]: result
                        }
                    })
                    .catch(e => {
                        logger.error('Error while searching: ' + e)
                        toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: `Something went wrong while searching for "${form.value.search}" on "${source}"`
                        })
                    })
            })

            await Promise.allSettled(promises)
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