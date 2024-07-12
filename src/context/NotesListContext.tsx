"use client";
import { useUser } from "@clerk/nextjs";
import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { Note } from "@/types";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { toast } from "@/components/ui/use-toast";
import { OrganizationContext } from "./OrganisationContext";

interface NotesListContextValue {
  notesList: Note[];
  selectedNotes: Note[];
  pinnedNotes: Note[];
  setPinnedNotes: (notes: Note[]) => void;
  setSelectedNotes: (notes: Note[]) => void;
  reloadNotesList: () => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  deleteSelectedNotes: () => Promise<void>;
  pinSelectedNotes: () => Promise<void>;
  saveNote: (note: Note) => Promise<void>;
  addNoteImage: (id: string, imageUrlToAdd: string) => Promise<void>;
  deleteNoteImage: (id: string, imageUrltoDelete: string) => Promise<void>;
  addImageToStorage: (file: File) => Promise<string>;
}

const NotesListContext = createContext<NotesListContextValue>({
  notesList: [],
  selectedNotes: [],
  pinnedNotes: [],
  setPinnedNotes: () => {},
  setSelectedNotes: () => {},
  reloadNotesList: async () => {},
  deleteNote: async (id) => {},
  deleteSelectedNotes: async () => {},
  pinSelectedNotes: async () => {},
  saveNote: async (note) => {},
  addNoteImage: async (id, imageUrlToAdd) => {},
  deleteNoteImage: async (id, imageUrltoDelete) => {},
  addImageToStorage: async (file) => {
    return "";
  },
});

const NotesListProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [notesList, setNotesList] = useState<Note[]>([]);

  const [selectedNotes, setSelectedNotes] = useState<Note[]>(() => {
    const storedSelectedNotes = localStorage.getItem("selectedNotes");
    return storedSelectedNotes ? JSON.parse(storedSelectedNotes) : [];
  });
  const [pinnedNotes, setPinnedNotes] = useState<Note[]>(() => {
    const storedPinnedNotes = localStorage.getItem("pinnedNotes");
    return storedPinnedNotes ? JSON.parse(storedPinnedNotes) : [];
  });

  const { deleteNoteFromOrganization } = useContext(OrganizationContext);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const notesCollection = collection(db, "notes");
      const notesQuery = 
      query(notesCollection, 
        where("userId", "==", user.id),
        where("orgId", "==", "")
      );
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

  const deleteNoteImage = async (id: string, imageUrltoDelete: string) => {
    if (!id) return;
    const noteRef = doc(db, "notes", id);
    const imageRef = ref(storage, imageUrltoDelete);
    try {
      await deleteObject(imageRef);
      await updateDoc(noteRef, {
        imageUrl: arrayRemove(imageUrltoDelete),
      });
      fetchNotes();
    } catch (error) {
      console.error("Error deleting image: ", error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!id) return;
    const noteRef = doc(db, "notes", id);
    try {
      const noteSnapshot = await getDoc(noteRef);
      if (!noteSnapshot.exists()) return;

      const noteData = noteSnapshot.data() as Note;

      const imageUrlArray = noteData.imageUrl || [];
      const deleteImagePromises = imageUrlArray.map((imageUrl) =>
        deleteNoteImage(id, imageUrl)
      );
      await Promise.all(deleteImagePromises);

      if (noteData.orgId !== undefined && noteData.orgId.length > 0) {
        console.log("Deleting note from organization", noteData.orgId);
        await deleteNoteFromOrganization(noteData.orgId, id);
        toast({
          variant: "destructive",
          title: "Note deleted from organization",
        });
      }

      await deleteDoc(noteRef);

      // Update localStorage arrays
      // updateSelectedLocalStorageArray(id);
      // updatePinnedLocalStorageArray(id);

      // Reload notes list
      fetchNotes();
    } catch (error) {
      console.error("Error deleting document and images: ", error);
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

  const deleteSelectedNotes = async () => {
    if (!selectedNotes.length) return;
    try {
      const selectedIds = selectedNotes.map((note) => note.id);

      await Promise.all(selectedNotes.map((note) => deleteNote(note.id)));

      const updatedPinnedNotes = pinnedNotes.filter(
        (note) => !selectedIds.includes(note.id)
      );

      setPinnedNotes(updatedPinnedNotes);
      localStorage.setItem("pinnedNotes", JSON.stringify(updatedPinnedNotes));

      setSelectedNotes([]);
      localStorage.setItem("selectedNotes", JSON.stringify([]));
      await fetchNotes();
    } catch (error) {
      console.error("Error deleting documents: ", error);
    }
  };

  const pinSelectedNotes = async () => {
    if (!selectedNotes.length) return;
    try {
      const notesToPin = selectedNotes.filter(
        (note) => !pinnedNotes.some((pinnedNote) => pinnedNote.id === note.id)
      );

      const updatedPinnedNotes = [...pinnedNotes, ...notesToPin];
      setPinnedNotes(updatedPinnedNotes);
      localStorage.setItem("pinnedNotes", JSON.stringify(updatedPinnedNotes));

      // Optionally, clear selected notes after pinning
      // setSelectedNotes([]);
      // localStorage.setItem("selectedNotes", JSON.stringify([]));
    } catch (error) {
      console.error("Error pinning documents: ", error);
    }
  };

  // const updateSelectedLocalStorageArray = (id: string) => {
  //   const updatedSelectedNotes = selectedNotes.filter(
  //     (note: Note) => note.id !== id
  //   );

  //   setSelectedNotes(updatedSelectedNotes);

  //   localStorage.setItem("selectedNotes", JSON.stringify(updatedSelectedNotes));
  // };

  // const updatePinnedLocalStorageArray = (id: string) => {
  //   const updatedPinnedNotes = pinnedNotes.filter(
  //     (note: Note) => note.id !== id
  //   );

  //   setPinnedNotes(updatedPinnedNotes);

  //   localStorage.setItem("pinnedNotes", JSON.stringify(updatedPinnedNotes));
  // };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("selectedNotes", JSON.stringify(selectedNotes));
    setSelectedNotes(selectedNotes);
  }, [selectedNotes]);

  useEffect(() => {
    localStorage.setItem("pinnedNotes", JSON.stringify(pinnedNotes));
    setPinnedNotes(pinnedNotes);
  }, [pinnedNotes]);

  return (
    <NotesListContext.Provider
      value={{
        notesList,
        pinnedNotes,
        setPinnedNotes,
        selectedNotes,
        setSelectedNotes,
        reloadNotesList: fetchNotes,
        deleteNote,
        deleteSelectedNotes,
        pinSelectedNotes,
        saveNote,
        addNoteImage,
        deleteNoteImage,
        addImageToStorage,
      }}
    >
      {children}
    </NotesListContext.Provider>
  );
};

export default NotesListProvider;
export { NotesListContext };
