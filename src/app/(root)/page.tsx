// pages/index.tsx

"use client";
import React, { useEffect, useContext, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Card from "@/components/Card";
import AddNote from "@/components/AddNote";
import { NotesListContext } from "@/context/NotesListContext";
import { Note } from "@/types";
import { useRouter } from "next/navigation";

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

  const pinnedGridRef = useRef<HTMLDivElement>(null);
  const notesGridRef = useRef<HTMLDivElement>(null);

  

  useEffect(() => {
    if (user?.id) {
      reloadNotesList();
    }
  }, [user]);

  const recalculateLayout = (gridRef: React.RefObject<HTMLDivElement>) => {
    if (!gridRef?.current) {
      return;
    }

    const allItems = gridRef.current.getElementsByClassName('grid-item');
    if (!allItems || allItems.length === 0) {
      console.warn("No grid items found.");
      return;
    }

    const gridComputedStyle = window.getComputedStyle(gridRef.current);
    const rowHeight = parseInt(gridComputedStyle.getPropertyValue("grid-auto-rows"));
    const rowGap = parseInt(gridComputedStyle.getPropertyValue("grid-row-gap"));

    if (isNaN(rowHeight) || isNaN(rowGap)) {
      console.warn("Failed to get grid row height or gap.");
      return;
    }

    for (let x = 0; x < allItems.length; x++) {
      const item = allItems[x] as HTMLElement;
      const content = item.querySelector(".content");

      if (!content) {
        console.warn(`Content not found for grid item at index ${x}.`);
        continue;
      }

      const contentHeight = content.getBoundingClientRect().height;
      const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = `span ${rowSpan}`;
    }
  };

  useEffect(() => {
    const recalculateAllLayouts = () => {
      recalculateLayout(pinnedGridRef);
      recalculateLayout(notesGridRef);
    };

    if (pinnedGridRef.current || notesGridRef.current) {
      recalculateAllLayouts();
      window.addEventListener("resize", recalculateAllLayouts);

      return () => {
        window.removeEventListener("resize", recalculateAllLayouts);
      };
    }
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
      setTimeout(recalculateLayout, 0);
    } else {
      setPinnedNotes([...pinnedNotes, note]);
      setTimeout(recalculateLayout, 0);
    }
  };

  const renderNotes = (notes: Note[], isPinned: boolean, gridRef: React.RefObject<HTMLDivElement>): JSX.Element => (
    <div
      ref={gridRef}
      className="grid grid-cols-1 max-sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-4 auto-rows-[0] w-full"
    >
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
              {renderNotes(pinnedNotes, true, pinnedGridRef)}
            </div>
          )}
          <h2 className="text-2xl font-bold text-white mb-4">NOTES</h2>
          {renderNotes(
            filteredAndSortedNotes.filter(
              (note) => !pinnedNotes.some((p) => p.id === note.id)
            ),
            false, notesGridRef
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
