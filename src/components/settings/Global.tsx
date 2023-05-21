import React, { memo } from 'react'
import { Form, Modal, Switch } from 'antd'

interface SettingsProps {
  open: boolean
  closeSettings: () => void
}

const Settings = memo(({ open, closeSettings }: SettingsProps) => {
  const [form] = Form.useForm()

  return (
    <Modal
      open={open}
      onCancel={closeSettings}
      title="设置"
      okText="保存"
      cancelText="取消"
    >
      <Form>
        <Form.Item
          name="compression"
          label="压缩图片"
          tooltip="是否将尺寸较大的图片等比压缩以适应页面高度或宽度"
        >
          <Switch checked={false}></Switch>
        </Form.Item>
      </Form>
    </Modal>
  )
})

Settings.displayName = 'GlobalSettings'

export default Settings
