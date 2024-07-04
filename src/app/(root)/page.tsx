"use client";
import React, { useEffect, useContext, useState, use } from "react";
import { useUser } from "@clerk/nextjs";
import Card from "@/components/Card";
import AddNote from "@/components/AddNote";
import { NotesListContext } from "@/context/NotesListContext";
import { Note } from "@/types";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const { notesList, reloadNotesList, deleteNote } =
    useContext(NotesListContext);

  const { selectedNotes, setSelectedNotes } = useContext(NotesListContext);

  const { pinnedNotes, setPinnedNotes } = useContext(NotesListContext);

  useEffect(() => {
    reloadNotesList();
  }, [user]);


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

  return (
    <div className="flex flex-col h-screen  w-full px-4 sm:px-6 lg:px-8">
      <div className="hidden max-sm:flex justify-center">
        <AddNote />
      </div>
      <div className="flex justify-center w-full">
        <div className="flex flex-col w-full max-w-7xl px-4 py-6">
          {pinnedNotes.length > 0 && (
            <div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">PINNED</h2>
              </div>
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mb-10">
                {pinnedNotes.map((note) => (
                  <Card
                    isOpen={true}
                    key={note.id}
                    note={note}
                    onClick={() => router.push(`/note/${note.id}`)}
                    handleSelectNote={handleSelectNote}
                    handlePinnedNote={handlePinnedNote}
                    isPinned={pinnedNotes.some((n) => n.id === note.id)}
                    isSelected={selectedNotes.some((n) => n.id === note.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">NOTES</h2>
          </div>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {notesList.map((note) => {
              const isPinned = pinnedNotes.some((n) => n.id === note.id);
              if (isPinned) return;
              return (
                <Card
                  isOpen={true}
                  key={note.id}
                  note={note}
                  onClick={() => router.push(`/note/${note.id}`)}
                  handleSelectNote={handleSelectNote}
                  handlePinnedNote={handlePinnedNote}
                  isPinned={pinnedNotes.some((n) => n.id === note.id)}
                  isSelected={selectedNotes.some((n) => n.id === note.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
