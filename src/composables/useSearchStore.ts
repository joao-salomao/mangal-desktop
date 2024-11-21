import {ref} from 'vue'
import {defineStore} from 'pinia'
import * as mangaService from '@/services/mangaService'
import {getAvailableSources} from '@/services/mangalCliService'
import * as logger from '@/services/logService'
import type Manga from '@/models/Manga'
import {useToast} from 'primevue/usetoast'

export const useSearchStore = defineStore('search', () => {
    const loading = ref(false)
    const loadingSources = ref(false)
    const form = ref({sources: [], search: ''})
    const sources = ref<string[]>([])
    const mangas = ref<Record<string, Manga[]>>({})
    const toast = useToast()

    async function fetchSources() {
        try {
            if (loadingSources.value || sources.value.length > 0) {
                return
            }

            loadingSources.value = true
            sources.value = await getAvailableSources()
        } catch (e: any) {
            logger.error('Error while fetching sources: ' + e)
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Something went wrong while fetching sources: ' + e.toString()
            })
        } finally {
            loadingSources.value = false
        }
    }

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
                            detail: `Something went wrong while searching for "${form.value.search}" on "${source}": ${e.toString()}`
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
        loadingSources,
        form,
        mangas,
        sources,
        search,
        fetchSources
    }
})