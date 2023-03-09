import React from 'react'
import { Card, List } from 'antd'
import { useLocation } from 'react-router-dom'
import { open } from '@tauri-apps/api/shell'
import '~/styles/imageList.scss'

const { Meta } = Card

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
            gutter: 16,
            xs: 2,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3
          }}
        dataSource={state.images}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{ width: 226, height: 319 }}
              cover={<img alt={item.name} src={item.url} onClick={async () => { await open(item.path) }}/>}
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
