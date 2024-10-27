<template>
<MangaList :mangas="libraryStore.mangas"/>
</template>
<script setup lang="ts">
import {onMounted} from 'vue'
import MangaList from '@/components/MangaList.vue'
import {useLibraryStore} from '@/composables/useLibraryStore'

const libraryStore = useLibraryStore()

onMounted(() => {
    libraryStore.fetchLibrary()
})
</script>