import { useDraggable } from "@dnd-kit/core"
import { Button } from "@heroui/react"

export default function Draggable(props: {id: string, children: React.ReactNode}) {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
      <Button ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {props.children}
      </Button>
  )
}