import React from 'react'
import { Card } from 'antd'
import { useLocation } from 'react-router-dom'

const { Meta } = Card

interface State {
  images: string[]
}

const ImageList: React.FC = () => {
  const location = useLocation()
  const { state }: { state: State } = location
  console.log(state.images)

  return (
      <Card
        hoverable
        style={{ width: 180 }}
        cover={
          <img
            alt="example"
            src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
          />
        }
      >
        <Meta title="Europe Street beat" description="www.instagram.com" />
      </Card>
  )
}

export default ImageList
