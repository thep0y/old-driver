import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/css'

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

export default DraggableImageListItem
