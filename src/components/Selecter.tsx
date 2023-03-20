import React, { useEffect, useState, lazy, useCallback } from 'react'
import { Spin } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { TauriEvent, type Event } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'

import '~/styles/selecter.scss'
import { generateThumbnails, selectImages } from '~/lib'

const FloatButtons = lazy(async () => await import('~/components/FloatButtons'))

const Selecter: React.FC = () => {
  const navigate = useNavigate()

  const [generating, setGenerating] = useState<boolean>(false)

  const handleSelect = useCallback(async (payload: string[]): Promise<void> => {
    setGenerating(true)

    // 使用文管选择文件和拖拽文件时操作系统会禁止路径重复，这里不需要去重。
    const thumbnails = await generateThumbnails(payload)

    setGenerating(false)

    navigate('/image-list', { state: { images: thumbnails } })
  }, [navigate])

  const handleImageSelection = useCallback(async (): Promise<void> => {
    const selected = await selectImages()

    if (selected == null) {
      return
    }

    void handleSelect(selected)
  }, [handleSelect])

  const handleWindowFileDrop = useCallback(async (e: Event<string[]>): Promise<void> => {
    void handleSelect(e.payload)
  }, [handleSelect])

  useEffect(() => {
    // 主页只执行一次的监听事件
    const unlisten = appWindow.once<string[]>(TauriEvent.WINDOW_FILE_DROP, handleWindowFileDrop)

    return () => {
      void unlisten.then(fn => { fn() })
    }
  }, [handleWindowFileDrop])

  return (
    <React.Suspense fallback={null}>
      <Spin
        spinning={generating}
        tip="正在生成缩略图..."
        wrapperClassName='selecting'
      >
        <span
          className="ant-upload-wrapper"
          role="button"
          id="selecter"
          onClick={handleImageSelection}
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

        <FloatButtons />
      </Spin>
    </React.Suspense>
  )
}

export default Selecter
