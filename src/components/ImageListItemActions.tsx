import React from 'react'
import { Button, Tooltip, message } from 'antd'
import {
  EyeOutlined,
  DeleteOutlined,
  RedoOutlined,
  UndoOutlined,
  SettingOutlined
} from '@ant-design/icons'
// import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api'

interface ActionsProps {
  show: boolean
  path: string
  removeImage: (path: string) => void
}

const Actions: React.FC<ActionsProps> = (props) => {
  // TODO: hover 时显示，离开后隐藏

  const { show, path, removeImage } = props

  return show
    ? (
      <div className="actions">
        <Tooltip
          placement="left"
          title="用图片浏览器打开"
          color="rgba(0, 0, 0, 0.6)"
        >
          <Button
            type="text"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={async () => {
              try {
                // await open(`"" "${path}"`)
                await invoke('open_file', { path })
              } catch (e) {
                console.error(e)
              }
            }}
          />
        </Tooltip>

        <Tooltip placement="left" title="移除此图片" color="rgba(0, 0, 0, 0.6)">
          <Button
            type="text"
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              removeImage(path)
            }}
          />
        </Tooltip>

        <Tooltip
          placement="left"
          title="向右旋转 90 度"
          color="rgba(0, 0, 0, 0.6)"
        >
          <Button
            type="text"
            shape="circle"
            icon={<RedoOutlined />}
            onClick={() => {
              void message.warning('尚未实现此功能')
            }}
          />
        </Tooltip>

        <Tooltip
          placement="left"
          title="向左旋转 90 度"
          color="rgba(0, 0, 0, 0.6)"
        >
          <Button
            type="text"
            shape="circle"
            icon={<UndoOutlined />}
            onClick={() => {
              void message.warning('尚未实现此功能')
            }}
          />
        </Tooltip>

        <Tooltip
          placement="left"
          title="设置图片样式"
          color="rgba(0, 0, 0, 0.6)"
        >
          <Button
            type="text"
            shape="circle"
            icon={<SettingOutlined />}
            onClick={() => {
              void message.warning('尚未实现此功能')
            }}
          />
        </Tooltip>
      </div>
      )
    : null
}

export default Actions
