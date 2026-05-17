import DefaultTheme from 'vitepress/theme'
import './custom.css'
import HomeLanding from './components/HomeLanding.vue'
import CustomLayout from './components/CustomLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app }) {
    app.component('HomeLanding', HomeLanding)
  }
}
