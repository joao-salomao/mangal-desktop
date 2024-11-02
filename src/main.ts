import {createApp} from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import PrimeVueRipple from 'primevue/ripple'
import PrimeVueTooltip from 'primevue/tooltip'
import PrimeVueToastService from 'primevue/toastservice'
import PrimeVueConfirmationService from 'primevue/confirmationservice'
import router from '@/router'
import {createPinia} from 'pinia'
import '@/assets/styles/index.css'

const pinia = createPinia()

createApp(App)
    .use(pinia)
    .use(router)
    .use(PrimeVue, {ripple: true})
    .use(PrimeVueToastService)
    .use(PrimeVueConfirmationService)
    .directive('ripple', PrimeVueRipple)
    .directive('tooltip', PrimeVueTooltip)
    .mount('#app')
