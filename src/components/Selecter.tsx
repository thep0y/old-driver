import React from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import { open } from '@tauri-apps/api/dialog'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { path } from '@tauri-apps/api'
import '~/styles/selecter.scss'

const select = async (navigate: NavigateFunction): Promise<void> => {
  const selected = await open({
    multiple: true,
    filters: [
      {
        name: '图片或 PDF 文件',
        extensions: ['png', 'jpg', 'jpeg', 'pdf']
      }
    ]
  })

  if (selected === null) {
    void message.warning('未选择任何文件')
    return
  }

  if (Array.isArray(selected)) {
    const images: ImageItem[] = []
    for (const v of selected) {
      const name = await path.basename(v)

      images.push({
        url: convertFileSrc(v),
        path: v,
        name
      })
    }
    navigate('/image-list', { state: { images } })
  } else {
    navigate('/image-list', { state: { images: [{ url: convertFileSrc(selected), name: await path.basename(selected) }] } })
  }
}
const Selecter: React.FC = () => {
  const navigate = useNavigate()

  return (
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
              单击打开文件管理器选择文件或直接在文件管理器中将目标文件拖拽到此窗口
            </p>
          </div>
        </span>
      </div>
    </span>
  )
}

export default Selecter
