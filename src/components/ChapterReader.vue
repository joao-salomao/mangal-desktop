<template>
<div ref="readerRef" class="reader-container">
    <div v-if="loading">
        Loading...
    </div>

    <template v-else>
        <VuePDF :key="page" v-for="page in pages" :pdf="pdf" :page="page"/>

        <div class="actions">
            Scale, scroll, and navigate with the arrow keys. Press Escape to exit fullscreen.
        </div>
    </template>
</div>
</template>
<script setup lang="ts">
import {useVModel} from '@vueuse/core'
import {VuePDF, usePDF} from '@tato30/vue-pdf'
import {readFile} from '@tauri-apps/plugin-fs'
import {onMounted, ref, watch} from 'vue'
import * as logger from '@/services/logService'
import {useFullscreen} from '@vueuse/core'
import {onKeyStroke} from '@vueuse/core'

const props = defineProps<{
    visible: boolean,
    chapterPath: string
}>()

const emit = defineEmits(['update:visible'])

const readerRef = ref<HTMLElement | null>(null)
const file = ref<Uint8Array | null>(null)
const loading = ref(false)

const {pdf, pages} = usePDF(file, {
    onProgress: (progress) => {
        loading.value = progress.loaded < progress.total
    }
})

const visibleModel = useVModel(props, 'visible', emit)

const fullscreen = useFullscreen(readerRef, {
    autoExit: false,
})

onMounted(async () => {
    try {
        loading.value = true
        await fullscreen.enter()
        file.value = await readFile(props.chapterPath)
        logger.info(`Read file ${props.chapterPath}`)
    } catch (e) {
        logger.error(`Failed to read file ${props.chapterPath}`, e)
    }
})

watch(loading, (newValue) => {
    if (!newValue) {
        setTimeout(() => {
            readerRef.value?.scrollBy(0, -9999999)
        }, 100)
    }
})

watch(fullscreen.isFullscreen, () => {
    visibleModel.value = fullscreen.isFullscreen.value
    if (!visibleModel.value) {
        file.value = null
    }
})

onKeyStroke('ArrowUp', () => {
    readerRef.value?.scrollBy(0, -100)
})

onKeyStroke('ArrowDown', () => {
    readerRef.value?.scrollBy(0, 100)
})

onKeyStroke('Escape', () => {
    fullscreen.exit()
})
</script>
<style scoped>
.reader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: scroll;

    .pdf {
        margin-bottom: 30px;
    }

    .actions {
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        background-color: var(--gray-800)
    }
}
</style>