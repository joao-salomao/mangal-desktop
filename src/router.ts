import {createMemoryHistory, createRouter} from 'vue-router'
import type {RouteRecordRaw, Router} from 'vue-router'

const routes: RouteRecordRaw[] = [
    {name: 'library', path: '/', component: () => import('@/pages/Library.vue')},
    {name: 'search', path: '/search', component: () => import('@/pages/Search.vue')},
    {name: 'settings', path: '/settings', component: () => import('@/pages/Settings.vue')},
]

const router: Router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router