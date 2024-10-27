<template>
<div>
    <InputGroup>
        <InputGroupAddon>Source</InputGroupAddon>
        <Dropdown v-model="searchStore.form.source" :options="sourceOptions" style="max-width: 200px"/>
        <InputGroupAddon>Name</InputGroupAddon>
        <InputText v-model="searchStore.form.search" style="max-width: 500px"/>
        <Button label="Search" :loading="searchStore.loading" :disabled="searchStore.loading"
                @click="searchStore.search"/>
    </InputGroup>

    <MangaList :mangas="searchStore.mangas" :allow-add-to-library="true"/>
</div>
</template>


<script setup lang="ts">
import InputGroupAddon from 'primevue/inputgroupaddon'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import {useSearchStore} from '@/composables/useSearchStore'
import MangaList from '@/components/MangaList.vue'

const sourceOptions = ['Mangapill', 'Manganelo', 'Manganato', 'Mangadex']

const searchStore = useSearchStore()
</script>
