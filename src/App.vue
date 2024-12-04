<template>
<div>
    <button @click="callMyCOmmand">CALL MY COMMAND</button>
    <AppHeader v-if="!fullscreen.isFullscreen"/>

    <main :class="{ fullscreen: fullscreen.isFullscreen }">
        <RouterView/>
    </main>

    <ScrollTop/>
    <Toast/>
    <ConfirmDialog/>
</div>
</template>
<script setup lang="ts">
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import AppHeader from '@/components/AppHeader.vue'
import ScrollTop from 'primevue/scrolltop'
import {useFullscreen} from '@/composables/useFullscreen.ts'
import { invoke } from '@tauri-apps/api/core';
import * as logger from '@/services/logService'

const fullscreen = useFullscreen()

function callMyCOmmand() {
    invoke('get_available_sources').then((res) => {
        logger.info(res)
    })
}
</script>
<style scoped>
main:not(.fullscreen) {
    margin-top: 80px;
    flex: 1 1 auto;
}
</style>
