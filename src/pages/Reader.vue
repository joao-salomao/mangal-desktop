<template>
<div ref="readerRef" class="reader-container">
    <ProgressSpinner v-if="loading"/>
    <div v-else-if="error" class="reader-error">
        <b>Failed to open reader</b>
        <p v-if="downloadedChapter">File path: {{ downloadedChapter?.path }}</p>
        <p>Error: {{ error }}</p>
    </div>
    <template v-else>
        <div v-if="manga && downloadedChapter" class="chapter-presentation ">
            <h4>{{ manga.title }}</h4>
            <h5>Chapter {{ downloadedChapter.chapter }}</h5>
        </div>

        <div class="pdf-container">
            <VuePDF class="pdf" :pdf="pdf" :page="currentPage"
                    :scale="scale"
                    :auto-destroy="true"
            />
        </div>
        <div class="settings">
            <div class="navigation-instructions">
                <p>Navigation</p>
                <small>Next page: Arrow Right, Right click</small>
                <small>Previous page: Arrow Left, Left click</small>
                <small>Scroll up: Arrow Up</small>
                <small>Scroll down: Arrow Down</small>
            </div>
            <p>Page: {{ currentPage }} / {{ pages }}</p>
            <div @click.capture.prevent>
                <label>Scale</label>
                <InputNumber input-class="scale-input" v-model="scale" :min="0.1" :max="2" :step="0.1"/>
            </div>
        </div>
    </template>
</div>
</template>
<script setup lang="ts">
import {VuePDF, usePDF} from '@tato30/vue-pdf'
import {readFile} from '@tauri-apps/plugin-fs'
import {computed, onMounted, ref, watch} from 'vue'
import {onKeyStroke} from '@vueuse/core'
import ProgressSpinner from 'primevue/progressspinner'
import {usePersistentState} from '@/composables/usePersistentState.ts'
import {StoreKey} from '@/services/keyValueDatabaseService.ts'
import {useRouter} from 'vue-router'
import {useLibraryStore} from '@/composables/useLibraryStore.ts'
import Manga from '@/models/Manga'
import DownloadedChapter from '@/models/DownloadedChapter.ts'
import {useFullscreen} from '@/composables/useFullscreen.ts'
import {useToast} from 'primevue/usetoast'

const toast = useToast()
const router = useRouter()
const libraryStore = useLibraryStore()
const fullcreen = useFullscreen()
const scale = usePersistentState({key: StoreKey.READER_SCALE, defaultValue: 1, readTransformer: parseFloat})

const file = ref<Uint8Array | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const readerRef = ref<HTMLElement | null>(null)

const manga = computed<Manga | undefined>(() => {
    const mangaId = parseInt(router.currentRoute.value.params.mangaId as string)
    const source = router.currentRoute.value.query.source as string
    return libraryStore.mangas[source]?.find(manga => manga.id === mangaId)
})

const downloadedChapter = computed<DownloadedChapter | undefined>(() => {
    const chapterId = parseInt(router.currentRoute.value.query.chapterId as string)
    return manga.value?.downloadedChapters?.find(chapter => chapter.id === chapterId)
})

const {pdf, pages} = usePDF(file, {
    onProgress: (progress) => {
        if (error.value) {
            return
        }

        loading.value = progress.loaded < progress.total
    },
    onError: (e: any) => {
        error.value = e.toString()
        loading.value = false
    }
})

function scrollToTop() {
    setTimeout(() => window.scroll({top: 0, behavior: 'smooth'}), 100)
}

function nextPage() {
    if (currentPage.value + 1 > pages.value) {
        const nextChapter = manga.value?.downloadedChapters?.find(chapter => chapter.chapter === downloadedChapter.value!.chapter + 1)
        if (nextChapter) {
            router.replace({
                params: {mangaId: manga.value!.id},
                query: {chapterId: nextChapter.id, source: manga.value!.source}
            })
            currentPage.value = 1
        } else {
            toast.add({
                severity: 'info',
                detail: 'The next chapter is not available',
                life: 4000
            })
        }

    } else {
        currentPage.value = currentPage.value + 1
    }
}

function previousPage() {
    if (currentPage.value - 1 < 1) {
        const previousChapter = manga.value?.downloadedChapters?.find(chapter => chapter.chapter === downloadedChapter.value!.chapter - 1)
        if (previousChapter) {
            router.replace({
                params: {mangaId: manga.value!.id},
                query: {chapterId: previousChapter.id, source: manga.value!.source}
            })
            currentPage.value = 1
        } else {
            if (downloadedChapter.value?.chapter === 1) {
                return
            }

            toast.add({
                severity: 'info',
                detail: 'The previous chapter is not available',
                life: 4000
            })
        }
    } else {
        currentPage.value = currentPage.value - 1
    }
}

async function loadChapter(chapter: DownloadedChapter) {
    loading.value = true

    if (!manga.value || !chapter) {
        error.value = 'Manga or chapter not found'
    }

    file.value = await readFile(chapter!.path)
}

onMounted(async () => {
    const isPdfContainer = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        return target.classList.contains('pdf') || target.classList.contains('pdf-container') || target instanceof HTMLCanvasElement
    }

    readerRef.value?.addEventListener('contextmenu', (event: MouseEvent) => {
        if (isPdfContainer(event)) {
            event.preventDefault()
            nextPage()
        }
    })

    readerRef.value?.addEventListener('click', (event: MouseEvent) => {
        if (isPdfContainer(event)) {
            previousPage()
        }
    })

    fullcreen.set(true)
})


watch(currentPage, scrollToTop)
watch(loading, (newValue) => {
    if (!newValue) {
        scrollToTop()
    }
})
watch(downloadedChapter, async () => {
    try {
        if (!downloadedChapter.value) {
            return
        }

        await loadChapter(downloadedChapter.value)
    } catch (e: any) {
        error.value = e.toString()
        loading.value = false
    }
}, {deep: true, immediate: true})

// TODO: implement smooth scrolling
onKeyStroke('ArrowUp', () => readerRef.value?.scrollBy(0, -100))
onKeyStroke('ArrowDown', () => readerRef.value?.scrollBy(0, 100))
onKeyStroke('ArrowLeft', previousPage)
onKeyStroke('ArrowRight', nextPage)
onKeyStroke('Escape', () => {
    fullcreen.set(false)
    router.back()
})
</script>
<style scoped>
.reader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: scroll;

    .p-progress-spinner {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .reader-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    .chapter-presentation {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .pdf-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .settings {
        position: fixed;
        width: 100%;
        max-width: 300px;
        bottom: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .navigation-instructions {
            display: flex;
            flex-direction: column;
            margin-bottom: 30px;
        }

        :deep(.scale-input) {
            max-width: 50px;
            max-height: 30px;
        }
    }
}
</style>