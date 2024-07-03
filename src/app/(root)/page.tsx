"use client";
import React, { useEffect, useContext, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Card from "@/components/Card";
import AddNote from "@/components/AddNote";
import { NotesListContext } from "@/context/NotesListContext";
import { Note } from "@/types";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const { notesList, reloadNotesList, deleteNote } = useContext(NotesListContext);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);

  useEffect(() => {
    reloadNotesList();
  }, [user]);

  const deleteSelectedNotes = async () => {
    if (!selectedNotes.length) return;
    try {
      await Promise.all(selectedNotes.map((note) => deleteNote(note.id)));
      await reloadNotesList();
    } catch (error) {
      console.error("Error deleting documents: ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen  w-full px-4 sm:px-6 lg:px-8">
      <div className="hidden max-sm:flex justify-center">
        <AddNote />
      </div>
      <div className="flex justify-center w-full">
        <div className="flex flex-col w-full max-w-7xl px-4 py-6">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {notesList.map((note) => (
              <Card
                isOpen={true}
                key={note.id}
                note={note}
                onClick={() => router.push(`/note/${note.id}`)}
                selectNote={() => setSelectedNotes([...selectedNotes, note])}
                unselectNote={() =>
                  setSelectedNotes(
                    selectedNotes.filter((n) => n.id !== note.id)
                  )
                }
                selectedNotes={selectedNotes}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
