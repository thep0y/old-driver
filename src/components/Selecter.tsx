import React from 'react'
import { InboxOutlined } from '@ant-design/icons'
import '~/styles/Selecter.scss'
import { open } from '@tauri-apps/api/dialog'

const select = async (): Promise<void> => {
  const selected = await open({
    multiple: true,
    filters: [
      {
        name: '图片或 PDF 文件',
        extensions: ['png', 'jpg', 'jpeg', 'pdf']
      }
      // {
      //   name: 'pdf 文件',
      //   extensions: ['pdf']
      // }
    ]
  })

  console.log(selected)
}

const Selecter: React.FC = () => {
  return (
    <span className="ant-upload-wrapper" id="selecter" onClick={select}>
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
