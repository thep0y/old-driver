import React from 'react'
import { Card } from 'antd'
import { useLocation } from 'react-router-dom'
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
      {state.images.map((item, idx) => (
        <Card
          key={idx}
          hoverable
          style={{ width: 180 }}
          cover={<img alt="example" src={item.url} />}
        >
          <Meta title={item.name} />
        </Card>
      ))}
    </div>
  )
}

export default ImageList
