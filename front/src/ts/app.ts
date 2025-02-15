import './bootstrap.ts' //アプリ全体でAPIとの通信が使えるようaxiosの設定をimport
import { createApp } from 'vue'
import { router } from './router.ts'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
app.use(router).use(pinia)
app.mount('#app')
