/**
 * Returns a new array with the elements of the original array shuffled.
 * Example: chunk([1, 2, 3, 4, 5], 2) => [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
    return Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
        array.slice(i * size, i * size + size)
    )
}

/**
 * It returns a new array with the values of the specified key from the original array.
 * Example: pluck([{id: 1, name: 'John'}, {id: 2, name: 'Jane'}], 'name') => ['John', 'Jane']
 */
export function pluck<T, K extends keyof T>(array: T[], key: K): T[K][] {
    return array.map(item => item[key])
}

/**
 * It returns a new hash map with the values of the specified key from the original array as keys.
 * Example: groupBy([{id: 1, name: 'John'}, {id: 2, name: 'Jane'}], 'id') => {1: {id: 1, name: 'John'}, 2: {id: 2, name: 'Jane'}}
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<T[K], T[]> {
    return array.reduce((acc, item) => {
        const group = item[key]
        if (!acc[group]) {
            acc[group] = []
        }
        acc[group].push(item)
        return acc
    }, {} as Record<T[K], T[]>)
}