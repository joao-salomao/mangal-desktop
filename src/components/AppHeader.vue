<template>
<div class="app-header">
    <Menubar :model="items">
        <template #start>
            <span class="app-name">Mangal Desktop</span>
        </template>

        <template #item="{ item, props, hasSubmenu }">
            <router-link v-if="item.route" :to="item.route" class="menu-item" active-class="menu-item--active"
                         v-bind="props.action" v-ripple>
                <span :class="item.icon"/>
                <span class="ml-2">{{ item.label }}</span>
            </router-link>

            <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                <span :class="item.icon"/>
                <span class="ml-2">{{ item.label }}</span>
                <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2"/>
            </a>
        </template>

        <template #end>
            <a class="pi pi-github" target="_blank" href="https://github.com/joao-salomao/mangal-desktop"
               style="text-decoration: none"/>
        </template>
    </Menubar>
</div>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar'
import {ref} from 'vue'
import type {MenubarProps} from 'primevue/menubar'

const items = ref<MenubarProps['model']>([
    {
        label: 'Library',
        icon: 'pi pi-book',
        route: '/'
    },
    {
        label: 'Search',
        icon: 'pi pi-search',
        route: 'search'
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        route: 'settings'
    },
])
</script>
<style scoped lang="css">
.app-header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 999;

    .app-name {
        font-size: 20px;
        margin-right: 10px;
        font-weight: 500;
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .menu-item--active {
        background: var(--gray-800);
    }
}
</style>