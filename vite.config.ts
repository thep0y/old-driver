/*
 * author   thepoy
 * file     vite.config.ts
 * created  2023-02-09 12:18:53
 * modified 2023-02-09 12:24:38
 */

import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'

import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

// eslint-disable-next-line no-undef
const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 1420
  },
  resolve: {
    alias: {
      '~/': `${pathSrc}/`
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "~/styles/element/index.scss" as *;'
      }
    }
  },
  plugins: [
    vue(),
    ElementPlus({}),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [
        /\.vue$/, /\.vue\?vue/, /\.md$/
      ],
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep']
        }),
        ElementPlusResolver({
          importStyle: 'sass'
        })
      ],
      dts: 'src/components.d.ts'
    }),

    Icons({
      autoInstall: true
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          warn: true
        })
      ],
      transformers: [
        transformerDirectives(),
        transformerVariantGroup()
      ]
    })
  ]
})