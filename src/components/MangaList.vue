<template>
<div style="position:relative">
    <div :key="source" v-for="(sourceMangas, source) in mangas" class="source-container">
        <h1 class="source-header">{{ source }}</h1>

        <ProgressSpinner v-if="loading && !sourceMangas.length"/>

        <Message v-else-if="!sourceMangas.length" severity="info" :closable="false">
            No manga found for this source
        </Message>

        <div v-else class="manga-list-container">
            <div
                v-for="(item, index) in sourceMangas"
                :key="[item.anilist?.id, index].join('-')"
                class="manga-container"
            >
                <div class="manga-details">
                    <img :src="item.metadata.cover.large" :alt="item.title" class="cover-image"/>

                    <div class="info">
                        <p class="name">{{ item.title }}</p>
                        <p class="summary">{{ item.metadata.summary }}</p>

                        <div v-if="item.downloadedChapters?.length" class="downloaded-chapters">
                            <p>Downloaded chapters</p>
                            <div>
                                <Button
                                    v-for="chapter in item.downloadedChapters"
                                    :key="chapter.id"
                                    size="small"
                                    :label="chapter.chapter.toString()"
                                    v-tooltip.top="`Open chapter ${chapter.chapter}: ${chapter.path}`"
                                    @click="openDownloadedChapterFile(chapter)"
                                />
                            </div>
                        </div>

                        <div class="actions">
                    <span v-tooltip="!item.chaptersCount ? 'There are no chapters available for download' : null">
                        <Button v-if="allowDownload" size="small" label="Download"
                                icon="pi pi-download"
                                :disabled="!item.chaptersCount"
                                @click="openDownloadDialog(item)"/>
                    </span>

                            <span
                                v-tooltip="mangasAddedToLibraryBySourceAndTitle[item.source]?.[item.title] ? 'This manga is already in your library' : null">
                        <Button v-if="allowAddToLibrary" size="small" label="Add to Library"
                                :disabled="mangasAddedToLibraryBySourceAndTitle[item.source]?.[item.title]"
                                @click="addToLibraryHandler(item)"/>
                    </span>

                            <Button v-if="item.anilist?.siteUrl" size="small" label="AniList page"
                                    icon="pi pi-external-link"
                                    @click="openAnilistPage(item)"/>

                            <Button v-if="item.id" size="small" label="Remove from Library" icon="pi pi-trash"
                                    severity="danger" @click="removeFromLibraryHandler(item)"/>
                        </div>
                    </div>
                </div>
            </div>

            <DownloadMangaChaptersDialog v-if="allowDownload" v-model:visible="showDownloadDialog"
                                         :manga="selectedManga"/>

            <ChapterReader v-if="showChapterReader" v-model:visible="showChapterReader"
                           :chapter-path="selectedChapter!.path"/>
        </div>
    </div>
</div>
</template>
<script setup lang="ts">
import type DownloadedChapter from '@/models/DownloadedChapter'
import type Manga from '@/models/Manga'
import {defineAsyncComponent, PropType} from 'vue'
import {ref, computed} from 'vue'
import {useToast} from 'primevue/usetoast'
import {useLibraryStore} from '@/composables/useLibraryStore'
import {useConfirm} from 'primevue/useconfirm'
import {isDownloadFolderSet} from '@/services/settingsService'
import {useRouter} from 'vue-router'

const ChapterReader = defineAsyncComponent(() => import('@/components/ChapterReader.vue'))
const DownloadMangaChaptersDialog = defineAsyncComponent(() => import('@/components/DownloadMangaChaptersDialog.vue'))

defineProps({
    mangas: {
        type: Object as PropType<Record<string, Manga[]>>,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    allowAddToLibrary: {
        type: Boolean,
        default: false
    },
    allowDownload: {
        type: Boolean,
        default: false
    }
})

const toast = useToast()
const confirm = useConfirm()
const libraryStore = useLibraryStore()
const router = useRouter()

const showDownloadDialog = ref(false)
const selectedManga = ref<Manga | null>(null)

const showChapterReader = ref(false)
const selectedChapter = ref<DownloadedChapter | null>(null)

const mangasAddedToLibraryBySourceAndTitle = computed<Record<string, Record<string, boolean>>>(() => {
    const mangas = libraryStore.mangas
    const result: Record<string, Record<string, boolean>> = {}

    for (const source in mangas) {
        if (!result[source]) {
            result[source] = {}
        }

        for (const manga of mangas[source]) {
            result[source][manga.title] = true
        }
    }

    return result
})

function openAnilistPage(manga: Manga) {
    const element = document.createElement('a')
    element.href = manga.anilist!.siteUrl
    element.target = '_blank'

    document.body.appendChild(element)

    element.click()
    element.remove()
}


async function addToLibraryHandler(manga: Manga) {
    try {
        await libraryStore.addToLibrary(manga)
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Manga ${manga.title} added to your library`,
            life: 4000
        })
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while adding the manga to the library: ' + e.toString(),
            life: 5000
        })
    }
}

function removeFromLibraryHandler(manga: Manga) {
    confirm.require({
        header: 'Remove from library',
        message: `Are you sure you want to remove ${manga.title} from your library?`,
        accept: async () => {
            await libraryStore.removeFromLibrary(manga)
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `Manga ${manga.title} removed from your library`,
                life: 4000
            })
        }
    })
}

function openDownloadedChapterFile(chapter: DownloadedChapter) {
    showChapterReader.value = true
    selectedChapter.value = chapter
}

async function openDownloadDialog(manga: Manga) {
    if (!manga.chaptersCount) {
        return
    }

    const isFolderSet = await isDownloadFolderSet()
    if (!isFolderSet) {
        return confirm.require({
            header: 'Download folder not set',
            message: 'You need to set the download folder in the settings before downloading chapters. Do you want to go to the settings page now?',
            accept: () => router.push({name: 'settings'}),
        })
    }

    selectedManga.value = manga
    showDownloadDialog.value = true
}
</script>
<style scoped>
.source-container {
    display: flex;
    flex-direction: column;

    .source-header {
        position: sticky;
        top: 73px;
        padding: 10px 0;
        font-size: 1.3rem;
        z-index: 2;
        background-color: var(--gray-700)
    }

    .manga-list-container {
        display: grid;
        grid-template-columns: auto;
        height: 100%;

        .manga-container {
            padding: 20px;

            .manga-details {
                display: flex;
                gap: 20px;

                .cover-image {
                    width: 230px;
                    height: 363px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                }

                .info {
                    .name {
                        font-size: 1.5rem;
                        margin-bottom: 10px;
                    }

                    .summary {
                        margin-bottom: 20px;
                    }

                    .downloaded-chapters {
                        margin-bottom: 20px;

                        p {
                            font-weight: bold;
                            margin-bottom: 5px;
                        }

                        div {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 5px;
                        }
                    }

                    .actions {
                        display: flex;
                        gap: 10px;
                    }
                }
            }
        }
    }
}
</style>