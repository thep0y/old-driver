import React from 'react'
import { Card } from 'antd'
import { useLocation } from 'react-router-dom'

const { Meta } = Card

const ImageList: React.FC = () => {
  const location = useLocation()
  const { state } = location
  console.log(state)

  return (
      <Card
        hoverable
        style={{ width: 240 }}
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
