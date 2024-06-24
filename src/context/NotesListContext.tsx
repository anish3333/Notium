'use client';
import { useUser } from "@clerk/nextjs";
import { createContext, useEffect, useState, ReactNode } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, doc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { Note } from "@/types";

interface NotesListContextValue {
  notesList: Note[];
  reloadNotesList: () => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NotesListContext = createContext<NotesListContextValue>({
  notesList: [],
  reloadNotesList: async () => {},
  deleteNote: async (id) => {}
});


const NotesListProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser(); 
  const [notesList, setNotesList] = useState<Note[]>([]);

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

      setNotesList(notesList);
    } catch (error) {
      console.error("Error fetching notes:", error);
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
  
  useEffect(() => {
    fetchNotes();
  }, [user]);

  return (
    <NotesListContext.Provider value={{ notesList, reloadNotesList: fetchNotes, deleteNote }}>
      {children}
    </NotesListContext.Provider>
  );
};

export default NotesListProvider;
export { NotesListContext };
