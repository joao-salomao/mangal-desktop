<template>
<div>
    <form @submit.prevent="searchStore.search">
        <InputGroup>
            <InputGroupAddon>Source</InputGroupAddon>
            <MultiSelect v-model="searchStore.form.sources" :options="searchStore.sources"
                         :disabled="searchStore.loadingSources"
                         :loading="searchStore.loadingSources" style="max-width: 400px"/>
            <InputGroupAddon>Name</InputGroupAddon>
            <InputText v-model="searchStore.form.search" style="max-width: 500px"/>
            <Button label="Search" type="submit" :loading="searchStore.loading"
                    :disabled="searchStore.loadingSources || searchStore.loading || !searchStore.form.search.length"
            />
        </InputGroup>
    </form>

    <MangaList :mangas="searchStore.mangas" :loading="searchStore.loading" :allow-add-to-library="true"/>
</div>
</template>


<script setup lang="ts">
import InputGroupAddon from 'primevue/inputgroupaddon'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import {useSearchStore} from '@/composables/useSearchStore'
import MangaList from '@/components/MangaList.vue'
import {onMounted} from 'vue'

const searchStore = useSearchStore()

onMounted(() => {
    searchStore.fetchSources()
})
</script>
