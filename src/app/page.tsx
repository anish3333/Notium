"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs"; // Import Clerk's useUser hook
import Card from "@/components/Card";
import AddButton from "@/components/AddButton";
import TextEditor from "@/components/TextEditor"; // Adjust the path as necessary
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { db } from "@/firebase/firebaseConfig";
import Navbar from "@/components/Navbar";

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId: string; // Add userId field
  // pinned: false;
}

const Page = () => {
  const { user } = useUser(); // Get the current user
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editorText, setEditorText] = useState<string>("");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const notesCollection = collection(db, "notes");
      const notesQuery = query(notesCollection, where("userId", "==", user.id));
      const notesSnapshot = await getDocs(notesQuery);
      const notesList = notesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];

      setNotes(notesList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log(user);
    fetchNotes();
  }, [user]);

  const addNote = async () => {
    if (!user) return;
    const newNote = {
      content: editorText,
      createdAt: new Date().toISOString(),
      userId: user.id,
    };
    try {
      await addDoc(collection(db, "notes"), newNote);
      setEditorText("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const openNoteEditor = (note: Note) => {
    setEditorText(note.content);
    setCurrentNoteId(note.id);
    setIsOpen(true);
  };

  const saveNote = async () => {
    // console.log("Saving note...", currentNoteId, editorText);

    if (!editorText.length) return;

    try {
      if (currentNoteId) {
        const noteRef = doc(db, "notes", currentNoteId);
        await updateDoc(noteRef, { content: editorText });
        setCurrentNoteId(null);
      } else {
        await addNote();
      }
      setIsOpen(false);
      fetchNotes();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!id) return;
    const noteRef = doc(db, "notes", id);
    try {
      await deleteDoc(noteRef);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const deleteSelectedNotes = async () => {
    if (!selectedNotes.length) return;
    try {
      await Promise.all(selectedNotes.map((note) => deleteNote(note.id)));
      fetchNotes();
    } catch (error) {
      console.error("Error deleting documents: ", error);
    }
  };

  if (!notes) return;

  return (
    <>
      <Navbar 
        deleteSelectedNotes={deleteSelectedNotes} 
      />
      <AddButton
        onClick={() => {
          setCurrentNoteId(null);
          setEditorText("");
          setIsOpen(true);
        }}
      />
      <div className="flex justify-center">
        <section className="flex min-h-screen flex-col px-6 py-6 max-md:pb-14 sm:px-14">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-x-4 space-y-4">
            {loading && <div className="w-64 h-32 text-white">Loading..</div>}
            {notes.map((note) =>
              isOpen && currentNoteId === note.id ? (
                <div
                  key={note.id}
                  className="w-64 h-32 bg-slate-950 mb-4"
                ></div>
              ) : (
                // <div key={note.id} className="mb-4 break-inside-avoid-column">
                <Card
                  isOpen={isOpen}
                  note={note}
                  onClick={() => openNoteEditor(note)}
                  selectNote={() => setSelectedNotes([...selectedNotes, note])}
                  unselectNote={() =>
                    setSelectedNotes(
                      selectedNotes.filter((n) => n.id !== note.id)
                    )
                  }
                  selectedNotes={selectedNotes}
                />
                // </div>
              )
            )}
          </div>
        </section>
      </div>
      <TextEditor
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={editorText}
        setContent={setEditorText}
        onSave={saveNote}
        onDelete={() => deleteNote(currentNoteId || "")} // Fix delete handler
      />
    </>
  );
};

export default Page;
