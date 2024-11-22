import {get, has, set, StoreKey} from '@/services/keyValueDatabaseService'
import {watchDebounced} from '@vueuse/core'
import {onMounted, ref} from 'vue'


/**
 * This composable provides a reactive state that is persisted with Tauri's key-value database. It reads the initial value
 * from the database when the component is mounted and writes the value to the database when the state changes. It also
 * provides a read and write transformer to serialize and deserialize the from and to the database, allowing the state
 * to be any kind of object or primitive type and still have type support.
 */
export function usePersistentState<T extends Object>(params: {
    key: StoreKey,
    defaultValue: T,
    readTransformer?: (value: string) => T
    writeTransformer?: (value: T) => string
}) {
    const state = ref<T>(params.defaultValue)

    watchDebounced(
        state,
        (value) => {
            const transformedValue: string = params.writeTransformer ? params.writeTransformer(value) : value.toString()
            set(params.key, transformedValue)
        },
        {debounce: 500, maxWait: 1000, deep: true},
    )

    onMounted(async () => {
        if (await has(params.key)) {
            const value = await get<string>(params.key)
            state.value = params.readTransformer ? params.readTransformer(value!) : value
        }
    })

    return state
}