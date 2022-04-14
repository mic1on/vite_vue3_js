import {createApp} from 'vue'
import App from './App.vue'
import router from '@/router'
import './assets/css/icon.css'
import {installPlugins} from "@/plugins";
const app = createApp(App)

installPlugins(app)

app.use(router)
app.mount('#app')
