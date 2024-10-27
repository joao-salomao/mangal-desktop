import {createApp} from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import PrimeVueRipple from 'primevue/ripple'
import PrimeVueTooltip from 'primevue/tooltip'
import PrimeVueToastService from 'primevue/toastservice'
import { createPinia } from 'pinia'
import '@/assets/styles/index.css'
import 'primevue/resources/themes/mira/theme.css'
import 'primeicons/primeicons.css'

const pinia = createPinia()

createApp(App)
    .use(pinia)
    .use(PrimeVue, {ripple: true})
    .use(PrimeVueToastService)
    .directive('ripple', PrimeVueRipple)
    .directive('tooltip', PrimeVueTooltip)
    .mount('#app')
