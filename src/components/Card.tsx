import React from 'react';
import { Note } from '@/app/page';

interface CardProps {
  note: Note;
  onDelete: () => void;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ note, onDelete, onClick }) => {
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
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 m-2 w-80 cursor-pointer" onClick={handleClick}>
      <div className="flex flex-col gap-4">
        <div className="text-sm font-medium text-gray-300 mb-2">{formattedDate}</div>
        <div dangerouslySetInnerHTML={{ __html: note.content }} className="text-3xl font-semibold text-white" />
        <div className="mt-4 flex justify-between items-center">
          <button
            className="z-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-red-300"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
