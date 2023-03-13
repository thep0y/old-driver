import React, { useEffect, useState } from 'react'
import { Spin } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import { TauriEvent } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'
import '~/styles/selecter.scss'
import { filterImages, generateThumbnails, selectImages } from '~/lib'

const select = async (navigate: NavigateFunction): Promise<void> => {
  const selected = await selectImages()

  if (selected == null) {
    return
  }

  navigate('/image-list', { state: { images: selected } })
}

const Selecter: React.FC = () => {
  const navigate = useNavigate()

  const [genertating, setGenertating] = useState(false)

  useEffect(() => {
    void appWindow.listen<string[]>(TauriEvent.WINDOW_FILE_DROP, async (e) => {
      setGenertating(true)

      const images = await filterImages(e.payload)

      // 当你在应用程序中使用拖放文件时，通常无法保证文件的顺序。
      // 这是因为不同的操作系统和文件管理器会以不同的顺序返回拖放的文件列表。
      // 这里选择使用 js 将文件名从小到大排列。
      images.sort((a, b) => a.localeCompare(b))

      const thumbnails = await generateThumbnails(images)

      setGenertating(false)

      navigate('/image-list', { state: { images: thumbnails } })
    })
  })

  return (
    <Spin
      spinning={genertating}
      tip="正在生成缩略图..."
      wrapperClassName='selecting'
    >
      <span
        className="ant-upload-wrapper"
        id="selecter"
        onClick={async () => {
          await select(navigate)
        }}
      >
        <div className="ant-upload ant-upload-drag">
          <span tabIndex={0} className="ant-upload ant-upload-btn" role="button">
            <div className="ant-upload-drag-container">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>

              <p className="ant-upload-text">选择图片或 PDF 文件</p>

              <p className="ant-upload-hint">
                单击打开文件管理器选择文件或将目标文件拖拽到此窗口
              </p>
            </div>
          </span>
        </div>
      </span>
    </Spin>
  )
}

export default Selecter
