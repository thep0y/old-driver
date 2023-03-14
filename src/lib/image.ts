/*
 * author   thepoy
 * file     dialog.ts
 * created  2023-03-11 14:52:46
 * modified 2023-03-11 14:53:04
 */

import { open } from '@tauri-apps/api/dialog'
import { invoke, path } from '@tauri-apps/api'
import { message } from 'antd'
import { IMAGE_EXTENSIONS } from './const'

const isObject = (variable: any): boolean => {
  return Object.prototype.toString.call(variable) === '[object Object]'
}

export const deduplicate = <T = number | string | SortedObject>(arr: T[], target: T[], property?: KeyOfType<T, number | string>): T[] => {
  if (isObject(arr[0])) {
    if (property == null) {
      throw Error('对数组对象去重时，必需传入作为判断条件的属性名')
    }

    return arr.filter(item => !target.map(v => v[property]).includes(item[property]))
  }

  return arr.filter(item => !target.includes(item))
}

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

/**
 * 将 filepath 以 filename 进行排序。
 *
 * 此方法应用作 Array.sort 的参数。
 *
 * @param   {string}  a  文件名
 * @param   {string}  b  文件名
 *
 * @return  {number}     顺序结果
 */
export const sortPathsByFilename = (a: string, b: string): number => {
  const filenameA = a.substring(a.lastIndexOf('/') + 1)
  const filenameB = b.substring(b.lastIndexOf('/') + 1)

  return filenameA.localeCompare(filenameB, 'zh-Hans-CN-u-co-pinyin', { numeric: true })
}

export const generateThumbnails = async (
  selected: string[]
): Promise<Thumbnail[]> => {
  // 先对路径去重
  const payload = [...new Set(selected)]

  // 再筛选图片
  const images = await filterImages(payload)

  // 当你在应用程序中使用拖放文件时，通常无法保证文件的顺序。
  // 这是因为不同的操作系统和文件管理器会以不同的顺序返回拖放的文件列表。
  // 这里选择使用 js 将文件名从小到大排列。
  const thumbnails = await invoke<Thumbnail[]>('generate_thumbnails', {
    images: images.sort(sortPathsByFilename)
  })

  return thumbnails
}

export const selectImages = async (): Promise<Thumbnail[] | null> => {
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
    return await generateThumbnails(selected)
  }

  return await generateThumbnails([selected])
}
