import React, { useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import TextEditor from "@/components/TextEditor";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { NotesListContext } from "@/context/NotesListContext";
import { usePathname } from "next/navigation";
import { OrganizationContext } from "@/context/OrganisationContext";
import { CirclePlus } from "lucide-react";

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
      orgId: pathName.includes("organisation") ? pathName.split("/")[2] : "",
    };
    try {
      const newNoteRef = await addDoc(collection(db, "notes"), newNote);

      if (newNote.orgId) {
        await addNoteToOrganization(newNote.orgId, newNoteRef.id);
      }

      await reloadNotesList();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <>
      
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
        onClick={() => setIsOpen(true)}
      >
        <CirclePlus
          className="max-sm:fixed max-sm:bottom-0 max-sm:right-0
          max-sm:m-5 max-sm:text-white h-5 w-5 flex justify-center items-center text-gray-500 cursor-pointer rounded-full"
        />
        <span className="max-sm:hidden">Add Note</span>
      </div>
      <TextEditor
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={addNote}
      />
    </>
  );
};

export default AddNote;
