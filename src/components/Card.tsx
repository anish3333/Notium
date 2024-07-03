import React from "react";
import { cn } from "@/lib/utils";
import { Note } from "@/types";
import { PinIcon, PinOffIcon } from "lucide-react";

interface CardProps {
  note: Note;
  onClick: () => void;
  isOpen: boolean;
  handleSelectNote: (note: Note) => void;
  handlePinnedNote: (note: Note) => void;
  isPinned: boolean;
  isSelected: boolean;
}

const Card: React.FC<CardProps> = ({
  note,
  onClick,
  handleSelectNote,
  isSelected,
  isPinned,
  handlePinnedNote,
}) => {
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

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleSelectNote(note);
  };

  const handlePin = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handlePinnedNote(note);
  };

  return (
    <div
      className={cn(
        "bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 cursor-pointer group break-inside-avoid-column",
        {
          "border border-white": isSelected,
        }
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2 p-1">
            <div className="text-xs sm:text-sm font-medium text-gray-300 mb-1">
              {formattedDate}
            </div>
            <div className="text-base sm:text-lg text-white max-h-40 overflow-hidden">
              {note.content}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div
            className={cn(
              "w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold transition-opacity duration-200",
              {
                "opacity-100": isSelected,
                "opacity-0 group-hover:opacity-100": !isSelected,
              }
            )}
            onClick={(e) => handleSelect(e)}
          >
            ✓
          </div>
          <div
            className={cn(
              "w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold transition-opacity duration-200",
              {
                "opacity-100": isPinned,
                "opacity-0 group-hover:opacity-100": !isPinned,
              }
            )}
            onClick={(e) => handlePin(e)}
          >
            {
              isPinned ? <PinOffIcon className="w-4 h-4"/> :  <PinIcon className="w-4 h-4" /> 
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
