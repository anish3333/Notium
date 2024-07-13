import React, { useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { Note } from "@/types";
import { PinIcon, PinOffIcon, Clock, Edit, CheckIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { NotesListContext } from "@/context/NotesListContext";

interface CardProps {
  note: Note;
  onClick: () => void;
  handleSelectNote: (note: Note) => void;
  handlePinnedNote: (note: Note) => void;
  isPinned: boolean;
  isSelected: boolean;
}

const Card: React.FC<CardProps> = ({
  note,
  onClick,
  handleSelectNote,
  handlePinnedNote,
  isPinned,
  isSelected,
}) => {
  const { handleSetReminder } = useContext(NotesListContext);
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(note.reminderDate || null);

  const formattedDate = new Date(note.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".clickable-area")) {
      onClick();
    }
  };

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleSelectNote(note);
  };

  const handlePin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handlePinnedNote(note);
  };

  const handleReminderClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsEditingReminder(!isEditingReminder);
  };

  const handleReminderChange = (date: Date | null) => {
    setReminderDate(date);
    handleSetReminder(note, date);
    setIsEditingReminder(false);
  };

  return (
    <div
      className={cn(
        "bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer group break-inside-avoid-column transition-opacity duration-200 hover:shadow-lg",
        {
          "border-2 border-blue-500": isSelected,
          "hover:border-gray-600": !isSelected,
        }
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs font-medium text-gray-400">{formattedDate}</div>
        <div className="flex space-x-2">
          <button
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
              {
                "bg-blue-500 text-white": isSelected,
                "bg-gray-700 text-gray-300 hover:bg-gray-600": !isSelected,
              }
            )}
            onClick={handleSelect}
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
              {
                "bg-yellow-500 text-white": isPinned,
                "bg-gray-700 text-gray-300 hover:bg-gray-600": !isPinned,
              }
            )}
            onClick={handlePin}
          >
            {isPinned ? <PinOffIcon className="w-4 h-4" /> : <PinIcon className="w-4 h-4" />}
          </button>
          <button
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
              "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
            onClick={handleReminderClick}
          >
            {reminderDate ? <Edit className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="clickable-area">
        <div className="text-base text-gray-300 max-h-40 overflow-hidden">{note.content}</div>
      </div>
      {reminderDate && (
        <div className="mt-2 text-sm text-yellow-400">
          Reminder: {reminderDate.toLocaleString()}
        </div>
      )}
      {isEditingReminder && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <DatePicker
            selected={reminderDate}
            onChange={handleReminderChange}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="bg-gray-700 text-white rounded p-2"
            placeholderText="Set reminder"
          />
        </div>
      )}
    </div>
  );
};

export default Card;