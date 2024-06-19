import React from "react";
import { Note } from "@/app/page";
import { cn } from "@/lib/utils";

interface CardProps {
  note: Note;
  onClick: () => void;
  isOpen: boolean;
}

const Card: React.FC<CardProps> = ({ note, onClick, isOpen }) => {
  // Format createdAt date
  const formattedDate = new Date(note.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).nodeName !== "BUTTON") {
      onClick();
    }
  };
  return (
    <div
      className={cn(
        "bg-gray-800 rounded-lg shadow-md p-6 m-2 w-50 cursor-pointer",
        {
          hidden: isOpen,
        }
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm font-medium text-gray-300 mb-2">
          {formattedDate}
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: note.content }}
          className="text-3xl font-semibold text-white max-h-40 overflow-hidden"
        />
      </div>
    </div>
  );
};

export default Card;
