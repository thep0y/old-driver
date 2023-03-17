import React from 'react'
import { FloatButton, message, Modal } from 'antd'
import {
  MergeCellsOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { invoke } from '@tauri-apps/api'
import { save } from '@tauri-apps/api/dialog'
import { open } from '@tauri-apps/api/shell'
import { documentDir } from '@tauri-apps/api/path'
import { getVersion } from '@tauri-apps/api/app'
import { selectImages } from '~/lib'

const version = async (): Promise<void> => {
  Modal.info({
    title: '关于',
    content: (
      <div>
        <p>
          当前版本：
          {await getVersion()}
        </p>
      </div>
    ),
    onOk () {}
  })
}

interface Props {
  images?: Thumbnail[]
  setImages?: (images: Thumbnail[]) => void
  setLoading?: (loading: boolean) => void
}

const FloatButtons: React.FC<Props> = (props) => {
  const { images, setImages, setLoading } = props

  return (
    <FloatButton.Group shape="circle" style={{ right: 24 }}>
      <FloatButton
        icon={<QuestionCircleOutlined />}
        tooltip={<div>帮助</div>}
        onClick={version}
      />

      { (images != null)
        ? (
          <FloatButton
            icon={<PlusOutlined />}
            tooltip={<div>添加新图片</div>}
            onClick={async () => {
              const selected = await selectImages()

              if (selected == null) return null

              setImages?.(images.concat(selected))
            }}
          />
          )
        : null}

      { (images != null)
        ? (
          <FloatButton
            icon={<ReloadOutlined />}
            tooltip={<div>清空</div>}
            onClick={() => {
              setImages?.([])
            }}
          />
          )
        : null}

      { (images != null)
        ? (
          <FloatButton
            type="primary"
            tooltip={<div>合并</div>}
            icon={<MergeCellsOutlined />}
            onClick={async () => {
              const defaultPath = (await documentDir()) + '/合并.pdf'

              const filePath = await save({
                title: '保存',
                filters: [
                  {
                    name: 'PDF',
                    extensions: ['pdf']
                  }
                ],
                defaultPath
              })

              if (filePath == null) {
                void message.warning('未选择要保存的路径')

                return
              }

              setLoading?.(true)

              try {
                await invoke<null>('merge_images_to_pdf', {
                  output: filePath,
                  images: images.map(v => ({ path: v.src }))
                })

                // 使用系统默认阅读器打开 pdf
                await open(filePath)

                void message.success('图片已合并：' + filePath)

                // 清空图片，回到首页
                setImages?.([])
              } catch (e) {
                void message.error(e as string)
              } finally {
                setLoading?.(false)
              }
            }}
          />
          )
        : null}

      <FloatButton
        icon={<SettingOutlined />}
        tooltip={<div>设置</div>}
      />

      { (images != null)
        ? <FloatButton.BackTop visibilityHeight={0} />
        : null }
    </FloatButton.Group>
  )
}

export default FloatButtons
