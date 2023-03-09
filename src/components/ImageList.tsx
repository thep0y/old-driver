import React from 'react'
import { Card, List, Button, Tooltip } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { open } from '@tauri-apps/api/shell'
import '~/styles/imageList.scss'

const { Meta } = Card

interface ActionsProps {
  show: boolean
  path: string
}

const Actions: React.FC<ActionsProps> = (props) => {
  // TODO: hover 时显示，离开后隐藏
  return props.show
    ? (
    <div className="actions">
      <Tooltip
        placement="left"
        title="用图片浏览器打开"
        color={'rgba(0, 0, 0, 0.6)'}
      >
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={async () => {
            await open(props.path)
          }}
        />
      </Tooltip>
      <Tooltip
        placement="left"
        title="移除此图片"
        color={'rgba(0, 0, 0, 0.6)'}
      >
        <Button type="text" icon={<DeleteOutlined />} />
      </Tooltip>
    </div>
      )
    : null
}

interface State {
  images: ImageItem[]
}

const ImageList: React.FC = () => {
  const location = useLocation()
  const { state }: { state: State } = location

  return (
    <div id="image-list">
      <List
        grid={{
          xs: 2,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 5,
          xxl: 6
        }}
        dataSource={state.images}
        renderItem={(item, idx) => (
          <List.Item>
            <Card
              hoverable
              style={{ width: 226, height: 319 }}
              cover={<img alt={item.name} src={item.url} />}
              extra={<Actions show={true} path={item.path} />}
            >
              <Meta title={item.name} />
            </Card>
          </List.Item>
        )}
      />
    </div>
  )
}

export default ImageList
