/*
 * author   thepoy
 * file     route.ts
 * created  2023-02-24 14:20:07
 * modified 2023-02-24 14:20:07
 */

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { convertFileSrc } from '@tauri-apps/api/tauri'

export const Routes = {
  Index:{ path:'/', name:'index' },
  ImageList: { path:'/image-list/:fileList+', name:'image-list' }
} as const

export type Route = keyof typeof Routes

const routes: Array<RouteRecordRaw> = [
  {
    ...Routes.Index,
    component: () => import('~/components/select-files.vue')
  },
  {
    ...Routes.ImageList,
    component: () => import('~/components/image-list.vue'),
    props: ({ params } ) => {
      params.fileList = (params.fileList as FilePath[]).map((v, i) => {
        console.log(v)

        return { uid: i, url:convertFileSrc(v), src: v }
      }) as any

      return params
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router