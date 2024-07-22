import React, { useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Note } from "@/types";
import {
  PinIcon,
  PinOffIcon,
  Clock,
  Edit,
  CheckIcon,
  MoreVertical,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { NotesListContext } from "@/context/NotesListContext";
import { Timestamp } from "firebase/firestore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [reminderDate, setReminderDate] = useState<Date | null>(null);

  useEffect(() => {
    if (note.reminderDate && note.reminderDate instanceof Timestamp) {
      setReminderDate(note.reminderDate.toDate());
    } else {
      setReminderDate(null);
    }
  }, [note.reminderDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleReminderChange = (date: Date | null) => {
    if (date) {
      setReminderDate(date);
      handleSetReminder(note, date);
    }
    setIsEditingReminder(false);
  };

  return (
    <div
      className={cn(
        "bg-gray-800 rounded-lg shadow-md p-6 group break-inside-avoid-column transition-all duration-200 hover:shadow-lg",
        {
          "border-2 border-blue-500": isSelected,
          "hover:border-gray-600": !isSelected,
        }
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs font-medium text-gray-400">
          {formatDate(new Date(note.createdAt))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="text-gray-400 hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0 border-none text-gray-800">
            <div className="flex flex-col">
              <button
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-700 hover:rounded-t-[5px] "
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectNote(note);
                }}
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                {isSelected ? "Deselect" : "Select"}
              </button>
              <button
                className="flex items-center px-3 py-2 text-sm  hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinnedNote(note);
                }}
              >
                {isPinned ? (
                  <>
                    <PinOffIcon className="w-4 h-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <PinIcon className="w-4 h-4 mr-2" />
                    Pin
                  </>
                )}
              </button>
              <button
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-700 rounded-b-[5px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingReminder(!isEditingReminder);
                }}
              >
                <Clock className="w-4 h-4 mr-2" />
                Set Reminder
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-base text-gray-300 max-h-40 overflow-hidden mb-2 mt-2">
        {note.content}
      </div>
      {reminderDate && reminderDate >= new Date() && (
        <div className="text-sm text-yellow-400 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {formatDate(reminderDate)}
        </div>
      )}
      {isEditingReminder && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <DatePicker
            selected={reminderDate}
            onChange={handleReminderChange}
            showTimeSelect
            timeIntervals={1}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="bg-gray-700 text-white rounded p-2 w-full"
            placeholderText="Set reminder"
            onClickOutside={() => setIsEditingReminder(false)}
            popperPlacement="bottom-start"
            shouldCloseOnSelect={false}
          />
        </div>
      )}
    </div>
  );
};

export default Card;
