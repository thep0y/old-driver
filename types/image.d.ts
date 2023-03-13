/*
 * author   thepoy
 * file     image.d.ts
 * created  2023-03-11 14:55:07
 * modified 2023-03-11 14:55:07
 */

declare interface ImageItem {
  base64: string
  path: string
  name: string
}

declare interface Image {
  path: string
  // rotate: number
  // scale: number
  // width: number
  // height: number
  // position: [number, number]
}

declare interface Thumbnail {
  src: string
  base64: string
  name: string
}
