<script setup lang="ts">
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Settings from '@/components/Settings.vue'
import Library from '@/components/Library.vue'
import Search from '@/components/Search.vue'
import Toast from 'primevue/toast'
</script>

<template>
<main>
    <TabView :lazy="true">
        <TabPanel>
            <template #header>
                <div class="flex justify-center align-center" style="gap: 6px">
                    <span>Library</span>
                    <i class="pi pi-book"/>
                </div>
            </template>

            <Library/>
        </TabPanel>

        <TabPanel>
            <template #header>
                <div class="flex justify-center align-center" style="gap: 6px">
                    <span>Search</span>
                    <i class="pi pi-search"/>
                </div>
            </template>

            <Search/>
        </TabPanel>


        <TabPanel>
            <template #header>
                <div class="flex justify-center align-center" style="gap: 6px">
                    <span>Settings</span>
                    <i class="pi pi-wrench"/>
                </div>
            </template>
            <Settings/>
        </TabPanel>
    </TabView>

    <Toast/>
</main>
</template>