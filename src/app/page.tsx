// pages/Page.tsx
"use client";

import React, { useState } from "react";
import Card from "@/components/Card";
import Sidebar from "@/components/Sidebar";
import TextEditor from "@/components/TextEditor"; // Adjust the path as necessary
import { cn } from "@/lib/utils";

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

const Page = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editorText, setEditorText] = useState<string>("");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  const addNote = () => {
    const newNote = {
      id: crypto.randomUUID(),
      content: editorText,
      createdAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    setEditorText(""); // Clear editor text after adding a note
  };

  const openNoteEditor = (note: Note) => {
    setEditorText(note.content);
    setCurrentNoteId(note.id);
    setIsOpen(true);
  };

  const saveNote = () => {
    console.log("Saving note...", currentNoteId, editorText);

    if (!editorText.length) return;

    if (currentNoteId) {
      setNotes(
        notes.map((note) =>
          note.id === currentNoteId ? { ...note, content: editorText } : note
        )
      );
      setCurrentNoteId(null);
    } else {
      addNote();
    }
    setIsOpen(false); // Close the editor after saving
  };

  const deleteNote = (id: string) => () => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className="flex">
      <Sidebar
        onClick={() => {
          setCurrentNoteId(null);
          setEditorText("");
          setIsOpen(true);
        }}
      />

      <section className="flex min-h-screen flex-1 flex-col px-6 py-6 max-md:pb-14 sm:px-14">
        <div className="flex flex-wrap gap-2">
          {notes.map((note) => (
            <Card
              isOpen={isOpen}
              key={note.id}
              note={note}
              onClick={() => openNoteEditor(note)}
            />
          ))}
        </div>

        <TextEditor
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          content={editorText}
          setContent={setEditorText}
          onSave={saveNote}
          onDelete={currentNoteId ? deleteNote(currentNoteId) : undefined}
        />
      </section>
    </div>
  );
};

export default Page;
