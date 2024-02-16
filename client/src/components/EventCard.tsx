import type { FC } from "react";
import type { Event } from "@/lib/api";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDate } from "@/lib/utils";

export interface CardProps {
  id: string;
  event: Event;
  index: number;
}

export const EventCard: FC<CardProps> = ({ id, event, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-200 dark:bg-gray-800 p-2 rounded-md touch-none"
      {...attributes}
      {...listeners}
    >
      <b>
        {index + 1}. {" "}
      </b>
      {event.name}
      <span className="text-sm text-slate-800 dark:text-gray-200">
        , le {formatDate(event.date)}
      </span>
    </div>
  );
};
