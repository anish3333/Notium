// pages/index.tsx

"use client";
import React, { useEffect, useContext, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Card from "@/components/Card";
import AddNote from "@/components/AddNote";
import { NotesListContext } from "@/context/NotesListContext";
import { Note } from "@/types";
import { useRouter } from "next/navigation";
import { requestNotificationPermission } from "@/lib/notificationUtils";
import { checkReminders } from "@/lib/reminderUtils";

const Page: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    reloadNotesList,
    selectedNotes,
    setSelectedNotes,
    pinnedNotes,
    setPinnedNotes,
    filteredAndSortedNotes,
  } = useContext(NotesListContext);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestNotificationPermission();
    const intervalId = setInterval(() => {
      if (user?.id) checkReminders(user.id);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      reloadNotesList();
    }
  }, [user]);

  useEffect(() => {
    const resizeGridItem = (item: HTMLElement) => {
      const rowHeight = parseInt(window.getComputedStyle(gridRef.current!).getPropertyValue('grid-auto-rows'));
      const rowGap = parseInt(window.getComputedStyle(gridRef.current!).getPropertyValue('grid-row-gap'));
      const contentHeight = item.querySelector('.content')!.getBoundingClientRect().height;
      const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = `span ${rowSpan}`;
    };

    const resizeAllGridItems = () => {
      const allItems = gridRef.current!.getElementsByClassName('grid-item');
      for (let x = 0; x < allItems.length; x++) {
        resizeGridItem(allItems[x] as HTMLElement);
      }
    };

    resizeAllGridItems();
    window.addEventListener('resize', resizeAllGridItems);

    return () => {
      window.removeEventListener('resize', resizeAllGridItems);
    };
  }, [filteredAndSortedNotes, pinnedNotes]);

  const handleSelectNote = (note: Note) => {
    const isSelected = selectedNotes.some((n) => n.id === note.id);
    if (isSelected) {
      setSelectedNotes(selectedNotes.filter((n) => n.id !== note.id));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const handlePinnedNote = (note: Note) => {
    const isPinned = pinnedNotes.some((n) => n.id === note.id);
    if (isPinned) {
      setPinnedNotes(pinnedNotes.filter((n) => n.id !== note.id));
    } else {
      setPinnedNotes([...pinnedNotes, note]);
    }
  };

  const renderNotes = (notes: Note[], isPinned: boolean): JSX.Element => (
    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-4 auto-rows-[0]">
      {notes.map((note) => (
        <div key={note.id} className="grid-item break-inside-avoid">
          <div className="content rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ">
            <Card
              note={note}
              onClick={() => router.push(`/note/${note.id}`)}
              handleSelectNote={handleSelectNote}
              handlePinnedNote={handlePinnedNote}
              isPinned={pinnedNotes.some((n) => n.id === note.id)}
              isSelected={selectedNotes.some((n) => n.id === note.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-center items-center pt-4">
        <div className="w-full max-w-7xl mx-auto">
          {pinnedNotes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">PINNED</h2>
              {renderNotes(pinnedNotes, true)}
            </div>
          )}
          <h2 className="text-2xl font-bold text-white mb-4">NOTES</h2>
          {renderNotes(
            filteredAndSortedNotes.filter(
              (note) => !pinnedNotes.some((p) => p.id === note.id)
            ),
            false
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 sm:hidden">
        <AddNote />
      </div>
    </div>
  );
};

export default Page;