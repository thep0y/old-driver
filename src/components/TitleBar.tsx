import React, { useState } from 'react'
import { appWindow } from '@tauri-apps/api/window'
import { Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import '~/styles/titleBar.scss'

interface MaximizeState {
  isMaximize: boolean
}

const TitleBar: React.FC<MaximizeState> = () => {
  const [isMaximize, setIsMaximize] = useState(false)

  const minimize = async (): Promise<void> => {
    await appWindow.minimize()
  }

  const toggleMaximize = async (): Promise<void> => {
    await appWindow.toggleMaximize()
    setIsMaximize((prev) => !prev)
  }

  const close = async (): Promise<void> => {
    await appWindow.close()
  }

  const changeCloseColor = (e: React.MouseEvent<HTMLDivElement>): void => {
    const svg = e.currentTarget.querySelector('svg')

    if (svg != null) {
      svg.style.color = 'white'
    }
  }

  const restoreCloseColor = (e: React.MouseEvent<HTMLDivElement>): void => {
    const svg = e.currentTarget.querySelector('svg')

    if (svg != null) {
      svg.style.color = 'black'
    }
  }

  let toggle, toggleTooltip

  if (isMaximize) {
    toggle = (
      <img src="https://api.iconify.design/mdi:window-restore.svg" alt="minimize" />
    )
    toggleTooltip = '恢复'
  } else {
    toggle = (
      <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="minimize" />
    )
    toggleTooltip = '最大化'
  }

  return (
    <div data-tauri-drag-region className="titlebar">
      <Tooltip placement="bottom" title="最小化">
        <div className="titlebar-button" id="titlebar-minimize" onClick={minimize}>
          <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
        </div>
      </Tooltip>

      <Tooltip placement="bottom" title={toggleTooltip}>
        <div className="titlebar-button" id="titlebar-maximize" onClick={toggleMaximize}>
          {toggle}
        </div>
      </Tooltip>

      <Tooltip placement="bottomRight" title="关闭">
        <div
          className="titlebar-button"
          id="titlebar-close"
          onClick={close}
          onMouseEnter={changeCloseColor}
          onMouseLeave={restoreCloseColor}
        >
          <CloseOutlined />
        </div>
      </Tooltip>
    </div>
  )
}

export default TitleBar
