import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: { 
        reset: true,  // 启用内置重置样式
        theme: 'on-demand'  // 按需生成主题变量
      } 
    })
  ],
  dark: 'class'
})