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
import { Button } from "./ui/button";
import { SetReminderModal } from "./SetReminderModal";

const bgColorList = [
  "#FFD6E0", // Soft pink
  "#C1E7E3", // Soft teal
  "#FFEFB5", // Soft yellow
  "#E0C3FC", // Soft lavender
];

interface CardProps {
  note: Note;
  onClick: () => void;
  handleSelectNote: (note: Note) => void;
  handlePinnedNote: (note: Note) => void;
  isPinned: boolean;
  isSelected: boolean;
  disabledOptions?: {
    select?: boolean;
    pin?: boolean;
    reminder?: boolean;
  };
}

const Card: React.FC<CardProps> = ({
  note,
  onClick,
  handleSelectNote,
  handlePinnedNote,
  isPinned,
  isSelected,
  disabledOptions = {},
}) => {
  const { handleSetReminder } = useContext(NotesListContext);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [bgColor] = useState(
    () => bgColorList[Math.floor(Math.random() * bgColorList.length)]
  );

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
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg shadow-md p-6 group break-inside-avoid-column transition-all duration-200 hover:shadow-xl text-gray-800",
        {
          "ring-2 ring-blue-400": isSelected,
          "hover:ring-1 hover:ring-gray-400": !isSelected,
        }
      )}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs font-medium text-gray-600">
          {formatDate(new Date(note.createdAt))}
        </div>
        {(!disabledOptions.select ||
          !disabledOptions.pin ||
          !disabledOptions.reminder) && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0 border-none bg-white shadow-lg rounded-md">
              <div className="flex flex-col">
                {!disabledOptions.select && (
                  <button
                    className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectNote(note);
                    }}
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {isSelected ? "Deselect" : "Select"}
                  </button>
                )}
                {!disabledOptions.pin && (
                  <button
                    className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
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
                )}
                {!disabledOptions.reminder && (
                    <button
                      className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsReminderModalOpen(true);
                      }}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Set Reminder
                    </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="text-base max-h-40 overflow-hidden mb-2 mt-2 leading-relaxed">
        {note.content}
      </div>
      <SetReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSetReminder={handleReminderChange}
        currentDate={new Date()}
      />
    </div>
  );
};

export default Card;
