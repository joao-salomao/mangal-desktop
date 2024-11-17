<template>
<Dialog v-model:visible="visibleModel" :modal="true" :header="manga?.title" :closable="!isDownloading"
        content-style="width: 600px">
    <div class="download-chapters-container">
        <div class="download-chapters-list">
            <Button label="Select all" size="small" @click="selectAllChapters"/>
            <Button label="Unselect all" size="small" @click="unselectAllChapters"/>
            <div
                :key="chapter"
                v-for="chapter in props.manga!.chaptersAvailableToDownload"
                class="chapter"
            >
                <label :for="`chapter-${chapter}`">{{ chapter }}</label>
                <Checkbox v-model="chaptersToDownload[chapter]" :input-id="`chapter-${chapter}`" :binary="true"/>
            </div>
        </div>
    </div>

    <template #footer>
        <Button class="download-button"
                :label="isDownloading ? `Download (${downloadProgress}%)` : 'Download'"
                :disabled="isDownloading || !hasSelectedChapters"
                :loading="isDownloading"
                @click="downloadSelectedChapters"/>
    </template>
</Dialog>
</template>
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import {useVModel} from '@vueuse/core'
import type Manga from '@/models/Manga'
import {computed, ref, watch} from 'vue'
import * as mangaService from '@/services/mangaService'
import {DownloadFolderNotSetError} from '@/errors'
import {useToast} from 'primevue/usetoast'
import {useLibraryStore} from '@/composables/useLibraryStore.ts'

const props = defineProps<{
    visible: boolean,
    manga: Manga | null
}>()

const emit = defineEmits(['update:visible'])

const toast = useToast()
const libraryStore = useLibraryStore()

const visibleModel = useVModel(props, 'visible', emit)
const chaptersToDownload = ref<Record<number, boolean>>({})
const isDownloading = ref(false)
const downloadProgress = ref(0)

const hasSelectedChapters = computed(() => Object.values(chaptersToDownload.value).some(selected => selected))

watch(visibleModel, (newValue) => {
    if (newValue) {
        chaptersToDownload.value = {}
    }
})

function selectAllChapters() {
    for (let i = 1; i <= props.manga!.chaptersAvailableToDownload; i++) {
        chaptersToDownload.value[i] = true
    }
}

function unselectAllChapters() {
    for (let i = 1; i <= props.manga!.chaptersAvailableToDownload; i++) {
        chaptersToDownload.value[i] = false
    }
}

async function downloadSelectedChapters() {
    const chapters: number[] = Object.entries(chaptersToDownload.value)
        .filter(([, selected]) => selected)
        .map(([chapter]) => parseInt(chapter))

    try {
        isDownloading.value = true
        for (const [index, chapter] of chapters.entries()) {
            await mangaService.download(props.manga!, chapter)
            downloadProgress.value = Math.round((index + 1) / chapters.length * 100)
        }

        toast.add({
            severity: 'success',
            summary: 'Download finished',
            detail: `Downloaded ${chapters.length} chapters`,
            life: 5_000
        })
    } catch (e: any) {
        if (e instanceof DownloadFolderNotSetError) {
            toast.add({
                severity: 'error',
                summary: 'Download folder not set',
                detail: 'Please set the download folder in the settings page',
                life: 5_000
            })
        } else {
            toast.add({
                severity: 'error',
                summary: 'Something went wrong',
                detail: e.toString(),
                life: 10_000
            })
        }
    } finally {
        isDownloading.value = false
        downloadProgress.value = 0
        libraryStore.fetchLibrary()
    }
}
</script>

<style scoped>
.download-chapters-container {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .download-chapters-list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: start;
        gap: 10px;
        max-height: 400px;

        .chapter {
            display: flex;
            gap: 3px;
        }
    }
}

.download-button {
    align-self: flex-end;
}
</style>