import React from 'react'
import { FloatButton, message } from 'antd'
import { MergeCellsOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { invoke } from '@tauri-apps/api'
import { save } from '@tauri-apps/api/dialog'
import { open } from '@tauri-apps/api/shell'
import { documentDir } from '@tauri-apps/api/path'

interface Props {
  images: Image[]
  clearImages: () => void
  setLoading: (loading: boolean) => void
}

const FloatButtons: React.FC<Props> = (props) => {
  const { images, clearImages, setLoading } = props

  return (
    <FloatButton.Group shape="circle" style={{ right: 24 }}>
      <FloatButton
        icon={<QuestionCircleOutlined />}
        tooltip={<div>帮助</div>}
        onClick={() => { void message.warning('未实现此功能') }}
      />

      <FloatButton
        icon={<ReloadOutlined />}
        tooltip={<div>清空</div>}
        onClick={() => { clearImages() }}
      />

      <FloatButton
        type="primary"
        tooltip={<div>合并</div>}
        icon={<MergeCellsOutlined />}
        onClick={ async () => {
          const defaultPath = await documentDir() + '/合并.pdf'

          const filePath = await save({
            title: '保存',
            filters: [{
              name: 'PDF',
              extensions: ['pdf']
            }],
            defaultPath
          })

          if (filePath == null) {
            void message.warning('未选择要保存的路径')

            return
          }

          setLoading(true)

          try {
            await invoke<null>('merge_images_to_pdf', { output: filePath, images })

            // 使用系统默认阅读器打开 pdf
            await open(filePath)

            void message.success('图片已合并：' + filePath)

            // 清空图片，回到首页
            clearImages()
          } catch (e) {
            void message.error(e as string)
          } finally {
            setLoading(false)
          }
        }}
      />

      <FloatButton.BackTop visibilityHeight={0} />
    </FloatButton.Group>
  )
}

export default FloatButtons
