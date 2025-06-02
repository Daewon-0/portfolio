import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Tailwind CSS 스타일
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app') 