/*
 * author   thepoy
 * file     dialog.ts
 * created  2023-03-11 14:52:46
 * modified 2023-03-11 14:53:04
 */

import { open } from '@tauri-apps/api/dialog'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { path } from '@tauri-apps/api'
import { message } from 'antd'
import { IMAGE_EXTENSIONS } from './const'

/**
 * 筛选图片文件。
 *
 * @param   {string[]}  files  文件管理器中选择的文件列表
 *
 * @return  {Promise<string>[]}          图片文件列表
 */
export const filterImages = async (files: string[]): Promise<string[]> => {
  const images = [] as string[]

  for (const file of files) {
    const extension = await path.extname(file)

    if (IMAGE_EXTENSIONS.includes(extension.toLowerCase())) {
      images.push(file)
    }
  }

  return images
}

export const convertToImageItems = async (src: string[]): Promise<ImageItem[]> => {
  const images: ImageItem[] = []

  for (const v of src) {
    const name = await path.basename(v)

    images.push({
      url: convertFileSrc(v),
      path: v,
      name
    })
  }

  return images
}

export const selectImages = async (): Promise<ImageItem[] | null> => {
  const selected = await open({
    multiple: true,
    filters: [
      {
        name: '图片',
        extensions: IMAGE_EXTENSIONS
      }
    ]
  })

  if (selected === null) {
    void message.warning('未选择任何文件')

    return null
  }

  if (Array.isArray(selected)) {
    return await convertToImageItems(selected)
  }

  return [{ path: selected, url: convertFileSrc(selected), name: await path.basename(selected) }]
}
