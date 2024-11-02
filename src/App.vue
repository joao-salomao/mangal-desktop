<script setup lang="ts">
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import AppHeader from '@/components/AppHeader.vue'
import ScrollTop from 'primevue/scrolltop'
</script>

<template>
<div>
    <AppHeader/>

    <main>
        <RouterView/>
    </main>

    <ScrollTop/>
    <Toast/>
    <ConfirmDialog/>
</div>
</template>
<style scoped>
main {
    margin-top: 80px;
    flex: 1 1 auto;
}
</style>
