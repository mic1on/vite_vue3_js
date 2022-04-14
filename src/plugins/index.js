import installElementPlus from '@/plugins/element'
import installPinia from '@/plugins/pinia'


export function installPlugins(app) {
    installElementPlus(app)
    installPinia(app)
}
