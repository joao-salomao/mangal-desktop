<template>
<div class="manga-list-container">
    <div
        v-for="(item, index) in mangas"
        :key="[item.anilist?.id, index].join('-')"
        class="manga-container"
    >
        <div class="manga-details">
            <img :src="item.metadata.cover.large" :alt="item.name" class="cover-image"/>

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
                            v-tooltip.top="'Open chapter'"
                            @click="openDownloadedChapterFile(chapter)"
                        />
                    </div>
                </div>

                <div class="actions">
                    <Button size="small" label="Download" @click="download(item)"/>
                    <Button size="small" label="Add to Library" @click="addToLibrary(item)"/>
                    <Button v-if="item.anilist?.siteUrl" size="small" label="AniList page"
                            @click="openAnilistPage(item)"/>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
<script setup lang="ts">
import Button from 'primevue/button'
import type Manga from '@/models/Manga.ts'
import {QueryResult} from '@/services/MangalCliService.ts'
import {MangaService} from '@/services/MangaService.ts'
import {DownloadFolderNotSetError} from '@/errors'
import {useToast} from 'primevue/usetoast'
import type DownloadedChapter from '@/models/DownloadedChapter'
import FileService from '@/services/FileService.ts'

defineProps<{
    mangas: Manga[]
}>()

const toast = useToast()

function openAnilistPage(item: QueryResult['result'][0]) {
    const element = document.createElement('a')
    element.href = item.anilist.siteUrl
    element.target = '_blank'

    document.body.appendChild(element)

    element.click()
    element.remove()
}

async function download(item: QueryResult['result'][0]) {
    try {
        await MangaService.getInstance().download(item, 2)
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
    }
}

async function addToLibrary(manga: Manga) {
    await MangaService.getInstance().addToLibrary(manga)
}

function openDownloadedChapterFile(chapter: DownloadedChapter) {
    FileService.getInstance().openFileWithDefaultHandler(chapter.path)
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