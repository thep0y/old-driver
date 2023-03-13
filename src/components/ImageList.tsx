import React, { useState, lazy, useEffect } from 'react'
import { Card, List, message, Spin } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core'
import { appWindow } from '@tauri-apps/api/window'
import { TauriEvent } from '@tauri-apps/api/event'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import '~/styles/imageList.scss'
import { generateThumbnails } from '~/lib'

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
  images: Thumbnail[]
}

const ImageList: React.FC = () => {
  const location = useLocation()
  const { state }: { state: State } = location
  const [images, setImages] = useState(state.images)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [genertating, setGenertating] = useState(false)

  useEffect(() => {
    if (images.length === 0) {
      navigate('/')
    }
  }, [images])

  useEffect(() => {
    void message.info('已生成缩略图，如果图片顺序不正确，你可通过拖动图片以调整顺序。')
  }, [])

  useEffect(() => {
    void appWindow.listen<string[]>(TauriEvent.WINDOW_FILE_DROP, async (e) => {
      setGenertating(true)

      const thumbnails = await generateThumbnails(e.payload)

      setGenertating(false)

      setImages(images.concat(thumbnails))
    })
  })

  const removeImage = (path: string): void => {
    setImages(images.filter((item) => item.src !== path))
  }

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 }
  })

  const onDragEnd = ({ active, over }: DragEndEvent): void => {
    if (active.id !== over?.id) {
      setImages((prev) => {
        const activeIndex = prev.findIndex((i) => i.src === active.id)
        const overIndex = prev.findIndex((i) => i.src === over?.id)

        return arrayMove(prev, activeIndex, overIndex)
      })
    }
  }

  return (
    <Spin
      spinning={loading || genertating}
      tip={loading ? '正在合并图片...' : '正在为新添加的图片生成缩略图...'}
      wrapperClassName='merging'
    >

      <div id="image-list">
        <DndContext
          sensors={[sensor]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.src)}
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
                          style={{ width: 210, height: 319 }}
                          cover={<img alt={item.name} src={item.base64} />}
                          extra={(
                            <React.Suspense>
                              <Actions
                                show={true}
                                path={item.src}
                                removeImage={removeImage}
                              />
                            </React.Suspense>
                          )}
                        >
                          <Meta title={item.name} />
                        </Card>
                      )}
                      src={item.src}
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
          images={images}
          setImages={setImages}
          setLoading={setLoading}
        />
      </React.Suspense>

    </Spin>
  )
}

export default ImageList
