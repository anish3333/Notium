"use client";
import { useUser } from "@clerk/nextjs";
import { createContext, useEffect, useState, ReactNode } from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { Note } from "@/types";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

interface NotesListContextValue {
  notesList: Note[];
  reloadNotesList: () => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  saveNote: (note: Note) => Promise<void>;
  addNoteImage: (id: string, imageUrlToAdd: string) => Promise<void>;
  deleteNoteImage: (id: string, imageUrltoDelete: string) => Promise<void>;
  addImageToStorage: (file: File) => Promise<string>;
}

const NotesListContext = createContext<NotesListContextValue>({
  notesList: [],
  reloadNotesList: async () => {},
  deleteNote: async (id) => {},
  saveNote: async (note) => {},
  addNoteImage: async (id, imageUrlToAdd) => {},
  deleteNoteImage: async (id, imageUrltoDelete) => {},
  addImageToStorage: async (file) => { return '';},
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

  const saveNote = async (note: Note) => {
    if (!note) return;
    try {
      await updateDoc(doc(db, "notes", note.id), {
        content: note.content,
        createdAt: note.createdAt,
        userId: note.userId,
        imageUrl: note.imageUrl,
      });
      fetchNotes();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const deleteNoteImage = async (id: string, imageUrltoDelete: string) => {
    if (!id) return;
    const noteRef = doc(db, "notes", id);
    try {
      await updateDoc(noteRef, {
        imageUrl: arrayRemove(imageUrltoDelete),
      });
      fetchNotes();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const addImageToStorage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };


  const addNoteImage = async (id: string, imageUrlToAdd: string) => {
    if (!id) return;
    const noteRef = doc(db, "notes", id);
    try {
      await updateDoc(noteRef, {
        imageUrl: arrayUnion(imageUrlToAdd),
      });
      fetchNotes();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  return (
    <NotesListContext.Provider
      value={{ notesList, reloadNotesList: fetchNotes, deleteNote, saveNote, addNoteImage, deleteNoteImage, addImageToStorage }}
    >
      {children}
    </NotesListContext.Provider>
  );
};

export default NotesListProvider;
export { NotesListContext };
