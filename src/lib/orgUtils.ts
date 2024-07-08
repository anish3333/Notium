import { db } from "@/firebase/firebaseConfig";
import { Note } from "@/types";
import { User } from "@clerk/clerk-sdk-node";
import { UserResource } from "@clerk/types";
import { doc, getDoc } from "firebase/firestore";

export const fetchOrganizationNotes = async (orgId: string, user: UserResource | null) => {
  if (!user) return [];
  try {
    const orgRef = doc(db, "organizations", orgId);
    const orgSnapshot = await getDoc(orgRef);
    if (!orgSnapshot.exists()) return [];
    const noteIds = orgSnapshot.data().notes;
    const notes = await Promise.all(noteIds.map(async (id : string) => {
      const noteRef = doc(db, "notes", id);
      const noteSnapshot = await getDoc(noteRef);
      return {
        id: noteSnapshot.id,
        ...noteSnapshot.data(),
      }
    })) as Note[];

    return notes;
  
  } catch (error) {
    console.error("Error fetching organization notes:", error);
    return [];
  }
};