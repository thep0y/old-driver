import React from 'react'
import { appWindow } from '@tauri-apps/api/window'
import { Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import '~/styles/titleBar.scss'

interface MaximizeState {
  isMaximize: boolean
}

class TitleBar extends React.Component<any, MaximizeState> {
  constructor (props: any) {
    super(props)
    this.state = { isMaximize: false }

    console.log('渲染标题栏')
  }

  minimize = async (): Promise<void> => {
    await appWindow.minimize()
  }

  toggleMaximize = async (): Promise<void> => {
    await appWindow.toggleMaximize()
    const { isMaximize } = this.state
    this.setState({ isMaximize: !isMaximize })
  }

  close = async (): Promise<void> => {
    await appWindow.close()
  }

  changeCloseColor = (e: any): void => {
    if (e.target != null) {
      const svg = (e.target as HTMLElement).querySelector('svg')
      if (svg != null) {
        svg.style.color = 'white'
      }
    }
  }

  restoreCloseColor = (e: any): void => {
    if (e.target != null) {
      const svg = (e.target as HTMLElement).querySelector('svg')
      if (svg != null) {
        svg.style.color = 'black'
      }
    }
  }

  render (): React.ReactNode {
    const { isMaximize } = this.state

    let toggle, toggleTooltip
    if (isMaximize) {
      toggle = (<img
        src="https://api.iconify.design/mdi:window-restore.svg"
        alt="minimize"
      />)
      toggleTooltip = '恢复'
    } else {
      toggle = (<img
        src="https://api.iconify.design/mdi:window-maximize.svg"
        alt="minimize"
      />)
      toggleTooltip = '最大化'
    }

    return (
      <div data-tauri-drag-region className="titlebar">
        <Tooltip placement="bottom" title="最小化">
          <div className="titlebar-button" id="titlebar-minimize" onClick={this.minimize}>
            <img
              src="https://api.iconify.design/mdi:window-minimize.svg"
              alt="minimize"
            />
          </div>
        </Tooltip>

        <Tooltip placement="bottom" title={toggleTooltip}>
          <div className="titlebar-button" id="titlebar-maximize" onClick={this.toggleMaximize}>
            {toggle}
          </div>
        </Tooltip>

        <Tooltip placement="bottomRight" title="关闭">
          <div
            className="titlebar-button"
            id="titlebar-close"
            onClick={this.close}
            onMouseEnter={this.changeCloseColor}
            onMouseLeave={this.restoreCloseColor}>
            <CloseOutlined />
          </div>
        </Tooltip>
      </div>
    )
  }
}

export default TitleBar
