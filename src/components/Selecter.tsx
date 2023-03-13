import React, { useEffect, useState } from 'react'
import { Spin } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import { TauriEvent } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'
import '~/styles/selecter.scss'
import { generateThumbnails, selectImages } from '~/lib'

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

      const thumbnails = await generateThumbnails(e.payload)

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
