<template>
<div ref="readerRef" class="reader-container">
    <div v-if="loading">
        Loading...
    </div>

    <template v-else>
        <div class="pdf-container">
            <VuePDF class="pdf" :pdf="pdf" :page="currentPage"
                    :scale="scale"
                    :auto-destroy="true"
            />
        </div>
        <div class="settings">
            <p>Page: {{ currentPage }} / {{ pages }}</p>
            <div>
                <label>Scale</label>
                <InputNumber input-class="scale-input" v-model="scale" :min="1" :max="2" :step="0.1"/>
            </div>
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
import {usePersistentState} from '@/composables/usePersistentState'
import {StoreKey} from '@/services/keyValueDatabaseService'

// TODO: move component to a page
// TODO: validate file existence

const props = defineProps<{
    visible: boolean,
    chapterPath: string
}>()

const emit = defineEmits(['update:visible'])

const readerRef = ref<HTMLElement | null>(null)
const file = ref<Uint8Array | null>(null)
const loading = ref(false)

const currentPage = ref(1)
const scale = usePersistentState({
    key: StoreKey.READER_SCALE,
    defaultValue: 1,
    readTransformer: parseFloat,
})

const {pdf, pages} = usePDF(file, {
    onProgress: (progress) => {
        loading.value = progress.loaded < progress.total
    }
})

const visibleModel = useVModel(props, 'visible', emit)

const fullscreen = useFullscreen(readerRef, {
    autoExit: false,
})

function scrollToTop() {
    setTimeout(() => readerRef.value?.scrollBy(0, -9999999), 100)
}

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


watch(currentPage, scrollToTop)
watch(loading, (newValue) => {
    if (!newValue) {
        scrollToTop()
    }
})

watch(fullscreen.isFullscreen, () => {
    visibleModel.value = fullscreen.isFullscreen.value
    if (!visibleModel.value) {
        file.value = null
        currentPage.value = 1
    }
})

onKeyStroke('ArrowUp', () => {
    readerRef.value?.scrollBy(0, -100)
})

onKeyStroke('ArrowDown', () => {
    readerRef.value?.scrollBy(0, 100)
})

onKeyStroke('ArrowRight', () => {
    currentPage.value = Math.min(currentPage.value + 1, pages.value)
})

onKeyStroke('ArrowLeft', () => {
    currentPage.value = Math.max(currentPage.value - 1, 1)
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
    background-color: var(--gray-800);

    .pdf-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .settings {
        position: fixed;
        width: 100%;
        max-width: 300px;
        bottom: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;

        :deep(.scale-input) {
            max-width: 45px;
            max-height: 30px;
        }
    }
}
</style>