<template>
<div>
    <p>Download folder: <small>{{ folder }}</small></p>
    <Button label="Change" size="small" @click="callUpdateDownloadFolder"/>
</div>
</template>
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import Button from 'primevue/button'
import {updateDownloadFolder, getDownloadFolder} from '@/services/settingsService'

const folder = ref<string | null>(null)

async function callUpdateDownloadFolder() {
    const newFolder = await updateDownloadFolder()
    if (newFolder) {
        folder.value = newFolder
    }
}

onMounted(async () => {
    folder.value = await getDownloadFolder()
})
</script>