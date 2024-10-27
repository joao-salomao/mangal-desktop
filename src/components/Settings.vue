<template>
<div>
    <p>Download folder: <small>{{ folder }}</small></p>
    <Button label="Change" size="small" @click="updateDownloadFolder"/>
</div>
</template>
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import Button from 'primevue/button'
import SettingsService from '@/services/SettingsService'

const folder = ref<string | null>(null)

async function updateDownloadFolder() {
    folder.value = await SettingsService.getInstance().updateDownloadFolder()
}

onMounted(async () => {
    folder.value = await SettingsService.getInstance().getDownloadFolder()
})
</script>