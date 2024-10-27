import type {QueryResult} from '@/services/MangalCliService.ts'

export function openAnilistPage(item: QueryResult['result'][0]) {
    const element = document.createElement('a')
    element.href = item.anilist.siteUrl
    element.target = '_blank'

    document.body.appendChild(element)

    element.click()
    element.remove()
}