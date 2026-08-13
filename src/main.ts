import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { updateSeo } from './utils/seo'
import './styles/index.css'

const app = createApp(App)

updateSeo()

app.use(router)

app.mount('#app')
