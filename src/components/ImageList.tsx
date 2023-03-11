import React, { useState, lazy, useEffect } from 'react'
import { Card, List, Spin } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import '~/styles/imageList.scss'

const { Meta } = Card

const Actions = lazy(
  async () => await import('~/components/ImageListItemActions')
)

const DraggableImageListItem = lazy(
  async () => await import('~/components/DraggableImageListItem')
)

const FloatButtons = lazy(
  async () => await import('~/components/FloatButtons')
)

interface State {
  images: ImageItem[]
}

const ImageList: React.FC = () => {
  const location = useLocation()
  const { state }: { state: State } = location
  const [images, setImages] = useState(state.images)
  const navigate = useNavigate()

  useEffect(() => {
    if (images.length === 0) {
      navigate('/')
    }
  }, [images])

  const [loading, setLoading] = useState(false)

  const removeImage = (path: string): void => {
    setImages(images.filter((item) => item.path !== path))
  }

  const clearImages = (): void => {
    setImages([])
  }

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 }
  })

  const onDragEnd = ({ active, over }: DragEndEvent): void => {
    if (active.id !== over?.id) {
      setImages((prev) => {
        const activeIndex = prev.findIndex((i) => i.path === active.id)
        const overIndex = prev.findIndex((i) => i.path === over?.id)

        return arrayMove(prev, activeIndex, overIndex)
      })
    }
  }

  return (
    <Spin
      spinning={loading}
      tip="正在合并图片..."
      wrapperClassName='merging'
    >

      <div id="image-list">
        <DndContext
          sensors={[sensor]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.path)}
            strategy={verticalListSortingStrategy}
          >
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
                  <React.Suspense>
                    <DraggableImageListItem
                      originNode={(
                        <Card
                          hoverable
                          style={{ width: 226, height: 319 }}
                          cover={<img alt={item.name} src={item.url} />}
                          extra={(
                            <React.Suspense>
                              <Actions
                                show={true}
                                path={item.path}
                                removeImage={removeImage}
                              />
                            </React.Suspense>
                          )}
                        >
                          <Meta title={item.name} />
                        </Card>
                      )}
                      item={item}
                    />
                  </React.Suspense>
                </List.Item>
              )}
            />
          </SortableContext>
        </DndContext>
      </div>

      <React.Suspense>
        <FloatButtons
          images={images.map(v => ({ path: v.path }))}
          clearImages={clearImages}
          setLoading={setLoading}
        />
      </React.Suspense>

    </Spin>
  )
}

export default ImageList
