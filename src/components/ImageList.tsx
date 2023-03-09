import React, { useEffect, useState } from 'react'
import { Card, List, Button, Tooltip, FloatButton } from 'antd'
import {
  EyeOutlined,
  DeleteOutlined,
  MergeCellsOutlined
} from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { open } from '@tauri-apps/api/shell'
import '~/styles/imageList.scss'

const { Meta } = Card

interface ActionsProps {
  show: boolean
  path: string
  removeImage: (path: string) => void
}

const Actions: React.FC<ActionsProps> = (props) => {
  // TODO: hover 时显示，离开后隐藏

  useEffect(() => {})

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
      <Tooltip placement="left" title="移除此图片" color={'rgba(0, 0, 0, 0.6)'}>
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => {
            props.removeImage(props.path)
          }}
        />
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

  const [images, setImages] = useState(state.images)

  const removeImage = (path: string): void => {
    setImages(images.filter((item) => item.path !== path))
  }

  return (
    <>
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
          dataSource={images}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                style={{ width: 226, height: 319 }}
                cover={<img alt={item.name} src={item.url} />}
                extra={
                  <Actions
                    show={true}
                    path={item.path}
                    removeImage={removeImage}
                  />
                }
              >
                <Meta title={item.name} />
              </Card>
            </List.Item>
          )}
        />
      </div>
      <FloatButton
        type="primary"
        tooltip={<div>合并</div>}
        icon={<MergeCellsOutlined />}
        onClick={() => {
          console.log('合并为 pdf', images)
        }}
      />
    </>
  )
}

export default ImageList
