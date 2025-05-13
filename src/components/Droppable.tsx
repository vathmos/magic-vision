import { useDroppable } from "@dnd-kit/core";

export default function Draggable(props: {id: string, children: React.ReactNode}) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  return (
    <div className={isOver ? "text-green-500" : undefined} ref={setNodeRef}>
      {props.children}
    </div>
  );
}