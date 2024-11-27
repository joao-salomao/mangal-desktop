import {ref} from 'vue'
import {getCurrentWindow} from '@tauri-apps/api/window'
import {defineStore} from 'pinia'

export const useFullscreen = defineStore('fullscreen', () => {
    const isFullscreen = ref(false)

    function set(value: boolean) {
        isFullscreen.value = value
        getCurrentWindow().setFullscreen(value)
    }

    function toggle() {
        set(!isFullscreen.value)
    }

    return {
        isFullscreen,
        set,
        toggle,
    }
})
