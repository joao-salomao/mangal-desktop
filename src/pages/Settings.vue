<template>
<div class="settings-page">
    <div class="setting-item">
        <p>Download folder: <small>{{ folder }}</small></p>
        <Button label="Change" size="small" @click="callUpdateDownloadFolder"/>
        <Button v-if="!isProd" label="Clear" size="small" severity="danger"
                @click="clearStoredDownloadFolderHandler"/>
    </div>
</div>
</template>
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import Button from 'primevue/button'
import {updateDownloadFolder, getDownloadFolder, clearStoredDownloadFolder} from '@/services/settingsService'

const folder = ref<string | null>(null)

const isProd = import.meta.env.PROD

async function callUpdateDownloadFolder() {
    const newFolder = await updateDownloadFolder()
    if (newFolder) {
        folder.value = newFolder
    }
}

async function clearStoredDownloadFolderHandler() {
    await clearStoredDownloadFolder()
    folder.value = null
}

onMounted(async () => {
    folder.value = await getDownloadFolder()
})
</script>
<style scoped>
.settings-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .setting-item {
        display: flex;
        gap: 14px;
        align-items: center;
    }
}
</style>