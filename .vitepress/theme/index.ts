import DefaultTheme from 'vitepress/theme'
import './custom.css'
import HomeLanding from './components/HomeLanding.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeLanding', HomeLanding)
  }
}
