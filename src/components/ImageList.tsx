import React, { useState } from 'react'
import { Card, List, FloatButton } from 'antd'
import { MergeCellsOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/css'
import '~/styles/imageList.scss'
import Actions from '~/components/ImageListItemActions'

const { Meta } = Card

interface State {
  images: ImageItem[]
}

interface DraggableImageListItemProps {
  originNode: React.ReactElement<
  any,
  string | React.JSXElementConstructor<any>
  >
  item: ImageItem
}

const DraggableImageListItem: React.FC<DraggableImageListItemProps> = ({
  originNode,
  item
}: DraggableImageListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.path
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move'
  }

  // prevent preview event when drag end
  const className = isDragging
    ? css`
        a {
          pointer-events: none;
        }
      `
    : ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
    >
      {/* {isDragging ? originNode.props.children : originNode} */}
      {originNode}
    </div>
  )
}

const ImageList: React.FC = () => {
  const location = useLocation()
  const { state }: { state: State } = location

  const [images, setImages] = useState(state.images)

  const removeImage = (path: string): void => {
    setImages(images.filter((item) => item.path !== path))
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

  console.log(images)

  return (
    <>
      <div id="image-list">
        <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
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
                  <DraggableImageListItem
                    originNode={
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
                    }
                    item={item}
                  />
                </List.Item>
              )}
            />
          </SortableContext>
        </DndContext>
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
