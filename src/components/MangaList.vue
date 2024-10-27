<template>
<div class="manga-list-container">
    <div
        v-for="(item, index) in mangas"
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
                    <Button v-if="allowDownload" size="small" label="Download"
                            v-tooltip="!item.chaptersCount ? 'There are no chapters available for download' : null"
                            @click="openDownloadDialog(item)"/>

                    <Button v-if="allowAddToLibrary" size="small" label="Add to Library"
                            @click="addToLibraryHandler(item)"/>

                    <Button v-if="item.anilist?.siteUrl" size="small" label="AniList page"
                            @click="openAnilistPage(item)"/>
                </div>
            </div>
        </div>
    </div>

    <DownloadMangaChaptersDialog v-model:visible="showDownloadDialog" :manga="selectedManga"/>
</div>
</template>
<script setup lang="ts">
import type {PropType} from 'vue'
import type DownloadedChapter from '@/models/DownloadedChapter'
import type Manga from '@/models/Manga'
import {ref} from 'vue'
import Button from 'primevue/button'
import {addToLibrary} from '@/services/mangaService'
import {openFileWithOSDefaultHandler} from '@/services/fileService'
import DownloadMangaChaptersDialog from '@/components/DownloadMangaChaptersDialog.vue'
import {useToast} from 'primevue/usetoast'

defineProps({
    mangas: {
        type: Array as PropType<Manga[]>,
        required: true
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

const showDownloadDialog = ref(false)
const selectedManga = ref<Manga | null>(null)

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
        await addToLibrary(manga)
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

function openDownloadedChapterFile(chapter: DownloadedChapter) {
    openFileWithOSDefaultHandler(chapter.path)
}

function openDownloadDialog(manga: Manga) {
    if (!manga.chaptersCount) {
        return
    }

    selectedManga.value = manga
    showDownloadDialog.value = true
}
</script>
<style scoped>
.manga-list-container {
    display: grid;
    grid-template-columns: auto auto;

    .manga-container {
        padding: 20px;

        .manga-details {
            display: flex;
            gap: 20px;

            .cover-image {
                width: 100%;
                height: 100%;
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

</style>