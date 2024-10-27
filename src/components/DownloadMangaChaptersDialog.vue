<template>
<Dialog v-model:visible="visibleModel" :modal="true" :header="manga?.title"
        content-style="width: 600px">
    <div class="download-chapters-container">
        <div class="download-chapters-list">
            <Button label="Select all" size="small" @click="selectAllChapters"/>
            <Button label="Unselect all" size="small" @click="unselectAllChapters"/>
            <div
                :key="chapter"
                v-for="chapter in props.manga!.chaptersCount"
                class="chapter"
            >
                <label :for="`chapter-${chapter}`">{{ chapter }}</label>
                <Checkbox v-model="chaptersToDownload[chapter]" :input-id="`chapter-${chapter}`" :binary="true"/>
            </div>
        </div>

        <ProgressBar v-if="isDownloading" :value="downloadProgress"/>

        <Button class="download-button" label="Download" :disabled="isDownloading" :loading="isDownloading"
                @click="downloadSelectedChapters"/>
    </div>
</Dialog>
</template>
<script setup lang="ts">
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import {useVModel} from '@vueuse/core'
import type Manga from '@/models/Manga'
import {ref} from 'vue'
import {MangaService} from '@/services/MangaService'
import {DownloadFolderNotSetError} from '@/errors'
import {useToast} from 'primevue/usetoast'

const props = defineProps<{
    visible: boolean,
    manga: Manga | null
}>()

const emit = defineEmits(['update:visible'])
const toast = useToast()

const visibleModel = useVModel(props, 'visible', emit)
const chaptersToDownload = ref<Record<number, boolean>>({})
const isDownloading = ref(false)
const downloadProgress = ref(0)

function selectAllChapters() {
    for (let i = 1; i <= props.manga!.chaptersCount; i++) {
        chaptersToDownload.value[i] = true
    }
}

function unselectAllChapters() {
    for (let i = 1; i <= props.manga!.chaptersCount; i++) {
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
            await MangaService.getInstance().download(props.manga!, chapter)
            downloadProgress.value = Math.round((index + 1) / chapters.length * 100)
        }
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
        toast.add({
            severity: 'success',
            summary: 'Download finished',
            detail: `Downloaded ${chapters.length} chapters`,
            life: 5_000
        })
    }
}
</script>

<style scoped>

.download-chapters-container {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .download-button {
        align-self: flex-end;
    }

    .download-chapters-list {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;

        .chapter {
            display: flex;
            gap: 3px;
        }
    }
}
</style>