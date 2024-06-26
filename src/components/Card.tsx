import React from 'react';
import { Note } from '@/app/(root)/page'; // Adjust the import path as needed
import { cn } from '@/lib/utils';

interface CardProps {
  note: Note;
  onClick: () => void;
  isOpen: boolean;
  selectNote: () => void;
  unselectNote: () => void;
  selectedNotes: Note[];
}

const Card: React.FC<CardProps> = ({ note, onClick, selectNote, unselectNote, selectedNotes }) => {  
  // Format createdAt date
  const formattedDate = new Date(note.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).nodeName !== 'BUTTON') {
      onClick();
    }
  };
  
  const isSelected = selectedNotes.some(n => n.id === note.id);

  const handleSelect = (e : React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isSelected) {
      unselectNote();
    } else {
      selectNote();
    }
  };

  return (
    <div
      className={cn(
        'bg-gray-800 rounded-lg shadow-md p-8 cursor-pointer relative group break-inside-avoid-column',{
          "border border-white": isSelected
        } // Added group class here
      )}
      onClick={handleClick}
    >
      <div
        className={cn("absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200", {
          "opacity-100":isSelected
        })}
        onClick={(e) => handleSelect(e)}
      >
        ✓
      </div>
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
