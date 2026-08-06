import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { updateSeo } from './utils/seo'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/base.css'
import './styles/animations.css'

const app = createApp(App)

updateSeo()

app.use(router)

app.mount('#app')
