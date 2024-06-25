"use client";

import React, { useState, useEffect, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import Card from "@/components/Card";
import AddButton from "@/components/AddButton";
import TextEditor from "@/components/TextEditor";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { NotesListContext } from "@/context/NotesListContext";

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
}

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const { notesList, reloadNotesList, deleteNote } = useContext(NotesListContext);

  const [isOpen, setIsOpen] = useState(false);
  const [editorText, setEditorText] = useState<string>("");
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);

  useEffect(() => {
    reloadNotesList();
  }, [user]);

  const addNote = async () => {
    if (!user) return;
    if (!editorText.length) return;
    const newNote = {
      content: editorText,
      createdAt: new Date().toISOString(),
      userId: user.id,
    };
    try {
      await addDoc(collection(db, "notes"), newNote);
      setEditorText("");
      await reloadNotesList();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

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
    <div>
      <Navbar deleteSelectedNotes={deleteSelectedNotes} />
      <AddButton onClick={() => setIsOpen(true)} />
      <div className="flex justify-center overflow-x-hidden">
        <section className="flex min-h-screen flex-col px-6 py-6 max-md:pb-14 sm:px-14">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {notesList.map((note) => (
              <Card
                key={note.id}
                isOpen={isOpen}
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

          <TextEditor
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            content={editorText}
            setContent={setEditorText}
            onSave={addNote}
          />
        </section>
      </div>
    </div>
  );
};

export default Page;
