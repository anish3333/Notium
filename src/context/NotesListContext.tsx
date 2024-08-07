"use client";
import { useUser } from "@clerk/nextjs";
import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
  useMemo,
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
import { Note, SortCriteria } from "@/types";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { toast } from "@/components/ui/use-toast";
import { OrganizationContext } from "./OrganisationContext";
import { usePathname} from "next/navigation";

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
  handleSetReminder: (note: Note, date: Date | null) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortCriteria: SortCriteria;
  setSortCriteria: (criteria: SortCriteria) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
  filteredAndSortedNotes: Note[];
  handleSortSelection: (criteria: SortCriteria) => void;
  toggleSortDirection: () => void;
  collaboratedNotes: Note[];
  fetchCollaboratedNotes: () => Promise<void>;
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
  handleSetReminder: async (note, date) => {},
  searchTerm: "",
  setSearchTerm: () => {},
  sortCriteria: "dateCreated",
  setSortCriteria: () => {},
  sortDirection: "desc",
  setSortDirection: () => {},
  filteredAndSortedNotes: [],
  handleSortSelection: () => {},
  toggleSortDirection: () => {},
  collaboratedNotes: [],
  fetchCollaboratedNotes: async () => {},
});

//TODO: COLLABORATORS AND AUTHOR HAVE DIFFERENT IDS SO STREAMLINE THAT INCONSISTENCY

const NotesListProvider = ({ children }: { children: ReactNode }) => {
  const path = usePathname();
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

  const [collaboratedNotes, setCollaboratedNotes] = useState<Note[]>([]);

  const {
    deleteNoteFromOrganization,
    removeOrgNoteFromSelectedNotes,
    removeOrgNoteFromPinnedNotes,
  } = useContext(OrganizationContext);



  const fetchCollaboratedNotes = async () => {
    if (!user) return;
    try {
      const userSnapshot = await getDocs(query(collection(db, "users"), where("userId", "==", user.id)));

      const userId = userSnapshot.docs[0].id;
      const collaborationsCollection = collection(db, "collaborations");
      const collaborationsQuery = query(
        collaborationsCollection,
        where("collaborators", "array-contains", userId)
      );
      const collaborationsSnapshot = await getDocs(collaborationsQuery);


      // Combine user notes and collaborator notes
      const collaboratorNotesIds = collaborationsSnapshot.docs.map((doc) => doc.id)

      console.log("collaboratorNotesIds", collaboratorNotesIds);

      const collaboratorNotesList = await Promise.all(collaboratorNotesIds.map(async (id) => {
        const collaboratorNoteDoc = await getDoc(doc(db, "notes", id));
        return {
          id: collaboratorNoteDoc.id,
          ...collaboratorNoteDoc.data(),
        }
      }));

      setCollaboratedNotes(collaboratorNotesList as Note[]);

    } catch (error) {
      console.error("Error fetching collaborated notes: ", error);
    }
  };

  const fetchNotes = async () => {
    if (!user) return;

    try {
      const userSnapshot = await getDocs(query(collection(db, "users"), where("userId", "==", user.id)));

      const userId = userSnapshot.docs[0].id;
      console.log("userId", userId);  
      
      const notesCollection = collection(db, "notes");

      // Query to get notes where the user is either the author or a collaborator
      const notesQuery = query(notesCollection, where("userId", "==", user.id));

      const notesSnapshot = await getDocs(notesQuery);
      const notesListLocal = notesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });

      setNotesList(notesListLocal as Note[]);
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
      fetchCollaboratedNotes();
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
        await deleteNoteFromOrganization(noteData.orgId, id);
        toast({
          variant: "destructive",
          title: "Note deleted from organization",
        });

        removeOrgNoteFromSelectedNotes(id);
        removeOrgNoteFromPinnedNotes(id);
      }

      await deleteDoc(noteRef);

      // Update localStorage arrays
      // updateSelectedLocalStorageArray(id);
      // updatePinnedLocalStorageArray(id);

      // Reload notes list
      fetchNotes();
      fetchCollaboratedNotes();
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
      fetchCollaboratedNotes();
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
      fetchCollaboratedNotes();
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
      await fetchCollaboratedNotes();
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

  const handleSetReminder = async (note: Note, date: Date | null) => {
    if (!note) return;
    try {
      await updateDoc(doc(db, "notes", note.id), {
        reminderDate: date,
        reminderSent: false,
      });
      fetchNotes();
      fetchCollaboratedNotes();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchCollaboratedNotes();
  }, [user]);


  useEffect(() => {
    localStorage.setItem("selectedNotes", JSON.stringify(selectedNotes));
    setSelectedNotes(selectedNotes);
  }, [selectedNotes]);

  useEffect(() => {
    localStorage.setItem("pinnedNotes", JSON.stringify(pinnedNotes));
    setPinnedNotes(pinnedNotes);
  }, [pinnedNotes]);


  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("dateCreated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSortSelection = (criteria: SortCriteria) => {
    if (sortCriteria === criteria) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortCriteria(criteria);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedNotes = useMemo(() => {
    const filtered = notesList.filter((note) =>
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortCriteria) {
        case "dateCreated":
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "title":
          comparison = a.content.localeCompare(b.content);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  }, [notesList, searchTerm, sortCriteria, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };




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
        handleSetReminder,
        searchTerm,
        setSearchTerm,
        sortCriteria,
        setSortCriteria,
        sortDirection,
        setSortDirection,
        filteredAndSortedNotes,
        handleSortSelection,
        toggleSortDirection,
        collaboratedNotes,
        fetchCollaboratedNotes,
      }}
    >
      {children}
    </NotesListContext.Provider>
  );
};

export default NotesListProvider;
export { NotesListContext };
