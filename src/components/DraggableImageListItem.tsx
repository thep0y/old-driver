import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { css } from '@emotion/css'

interface DraggableImageListItemProps {
  originNode: React.ReactElement<
  any,
  string | React.JSXElementConstructor<any>
  >
  src: string
}

const DraggableImageListItem: React.FC<DraggableImageListItemProps> = ({
  originNode,
  src
}: DraggableImageListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: src
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
