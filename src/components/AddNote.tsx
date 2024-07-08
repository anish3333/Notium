import React, { useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import AddButton from "@/components/AddButton";
import TextEditor from "@/components/TextEditor";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { NotesListContext } from "@/context/NotesListContext";
import { usePathname} from "next/navigation";
import { OrganizationContext } from "@/context/OrganisationContext";
import path from "path";

const AddNote: React.FC = () => {
  const { user } = useUser();
  const { reloadNotesList } = useContext(NotesListContext);
  const [isOpen, setIsOpen] = useState(false);
  const { addNoteToOrganization } = useContext(OrganizationContext);
  const pathName = usePathname();

  const addNote = async (content: string, imageUrl: string[]) => {
    if (!user) return;
    if (!content.length) return;
    
    const newNote = {
      content,
      createdAt: new Date().toISOString(),
      userId: user.id,
      imageUrl,
    };
    try {
      const newNoteRef = await addDoc(collection(db, "notes"), newNote);

      if (pathName.split("/")[1] === "organisation") {
        const orgId = pathName.split("/")[2];
        console.log(pathName);
        console.log(orgId, newNoteRef.id);
        await addNoteToOrganization(orgId, newNoteRef.id);
      }

      await reloadNotesList();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <>
      <AddButton onClick={() => setIsOpen(true)} />
      <TextEditor
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={addNote}
      />
    </>
  );
};

export default AddNote;
