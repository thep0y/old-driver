import React, { lazy, useCallback, useState } from 'react'
import { FloatButton, message, Modal } from 'antd'
import {
  MergeCellsOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { invoke } from '@tauri-apps/api'
import { save } from '@tauri-apps/api/dialog'
import { open } from '@tauri-apps/api/shell'
import { documentDir } from '@tauri-apps/api/path'
import { getVersion, getTauriVersion } from '@tauri-apps/api/app'
import { version, type as platformType, arch } from '@tauri-apps/api/os'
import { selectImages } from '~/lib'

const GlobalSettings = lazy(() => import('~/components/settings/Global'))

const about = async (): Promise<void> => {
  const v = await getVersion()
  const tauri = await getTauriVersion()
  const repoURL = 'https://github.com/thep0y/old-driver'
  const license = 'https://github.com/thep0y/old-driver/blob/main/LICENSE'

  const systemVersion = await version()
  const systemArch = await arch()

  const getSystem = async (): Promise<string> => {
    switch (await platformType()) {
      case 'Windows_NT':
        return 'Windows'
      case 'Darwin':
        return 'macOS'
      case 'Linux':
        return 'Linux'
    }
  }

  Modal.info({
    title: '关于',
    content: (
      <>
        <br />

        <div>
          <p>
            版本：
            {v}
          </p>
        </div>

        <div>
          <p>
            地址：
            <a
              onClick={async () => {
                await open(repoURL)
              }}
            >
              {repoURL}
            </a>
          </p>
        </div>

        <div>
          <p>
            证书：
            <a
              onClick={async () => {
                await open(license)
              }}
            >
              MIT
            </a>
          </p>
        </div>

        <div>
          <p>
            tauri：
            {tauri}
          </p>
        </div>

        <div>
          <p>
            系统：
            {await getSystem()} {systemArch} {systemVersion}
          </p>
        </div>
      </>
    ),
    okText: '关闭',
  })
}

interface Props {
  images?: Thumbnail[]
  setImages?: (images: Thumbnail[]) => void
  setLoading?: (loading: boolean) => void
}

const FloatButtons: React.FC<Props> = (props) => {
  const { images, setImages, setLoading } = props
  const [openSettings, setOpenSettings] = useState(false)

  const handleOpenSettings = useCallback(() => {
    setOpenSettings(true)
  })

  const handleCloseSettings = useCallback(() => {
    setOpenSettings(false)
  })

  return (
    <>
      <FloatButton.Group shape="circle" style={{ right: 24 }}>
        <FloatButton
          icon={<InfoCircleOutlined />}
          tooltip={<div>关于</div>}
          onClick={about}
        />

        {images != null ? (
          <FloatButton
            icon={<PlusOutlined />}
            tooltip={<div>添加新图片</div>}
            onClick={async () => {
              const selected = await selectImages()

              if (selected == null) return null

              setImages?.(images.concat(selected))
            }}
          />
        ) : null}

        {images != null ? (
          <FloatButton
            icon={<ReloadOutlined />}
            tooltip={<div>清空</div>}
            onClick={() => {
              setImages?.([])
            }}
          />
        ) : null}

        {images != null ? (
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
                    extensions: ['pdf'],
                  },
                ],
                defaultPath,
              })

              if (filePath == null) {
                void message.warning('未选择要保存的路径')

                return
              }

              setLoading?.(true)

              try {
                await invoke<null>('merge_images_to_pdf', {
                  output: filePath,
                  images: images.map((v) => ({ path: v.src })),
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
        ) : null}

        <FloatButton
          icon={<SettingOutlined />}
          onClick={handleOpenSettings}
          tooltip="设置"
        />

        {images != null ? <FloatButton.BackTop visibilityHeight={0} /> : null}
      </FloatButton.Group>

      <React.Suspense fallback={null}>
        <GlobalSettings
          open={openSettings}
          closeSettings={handleCloseSettings}
        />
      </React.Suspense>
    </>
  )
}

export default FloatButtons
