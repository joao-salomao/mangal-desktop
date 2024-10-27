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