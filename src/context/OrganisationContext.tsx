"use client";
import { useUser } from "@clerk/nextjs";
import { createContext, useEffect, useState, ReactNode } from "react";
import { db, storage } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  addDoc,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { usePathname } from "next/navigation";
import { fetchOrganizationNotes } from "@/lib/orgUtils";
import { Note } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { User } from "@clerk/clerk-sdk-node";
import { deleteObject, ref } from "firebase/storage";

interface Organization {
  id: string;
  name: string;
  author: string;
  members: string[];
  notes: string[];
}

interface JoinRequest {
  id: string;
  orgId: string;
  status: string;
  user: User;
}

interface joinRequestDoc {
  orgId: string;
  userId: string;
  status: string;
}

enum JoinRequestStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

interface OrganizationContextValue {
  orgNotes: Note[];
  members: User[];
  currentOrganization: Organization | undefined;
  organizations: Organization[];
  joinRequests: JoinRequest[];
  addOrganization: (name: string, members?: string[]) => Promise<void>;
  requestJoinOrganization: (orgId: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  addNoteToOrganization: (orgId: string, noteId: string) => Promise<void>;
  reloadOrganizations: () => Promise<void>;
  reloadJoinRequests: () => Promise<void>;
  removeMemberFromOrganization: (
    orgId: string,
    userId: string
  ) => Promise<void>;
  deleteNoteFromOrganization: (orgId: string, noteId: string) => Promise<void>;
  fetchOrganizationMembers: (orgId: string) => Promise<void>;
  orgPinnedNotes: { [orgId: string]: Note[] };
  orgSelectedNotes: { [orgId: string]: Note[] };
  setOrgPinnedNotes: (orgId: string, notes: Note[]) => void;
  setOrgSelectedNotes: (orgId: string, notes: Note[]) => void;
  getCurrentOrganizationNotes: (orgId: string) => void;
  pinAllOrgSelectedNotes: () => Promise<void>;
  removeOrgNoteFromSelectedNotes: (noteId: string) => Promise<void>;
  removeOrgNoteFromPinnedNotes: (noteId: string) => Promise<void>;
  leaveOrganization: (orgId: string) => Promise<void>;
  deleteOrganization: (orgId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue>({
  orgNotes: [],
  members: [],
  currentOrganization: undefined,
  organizations: [],
  joinRequests: [],
  addOrganization: async () => {},
  requestJoinOrganization: async () => {},
  approveJoinRequest: async () => {},
  rejectJoinRequest: async () => {},
  addNoteToOrganization: async () => {},
  reloadOrganizations: async () => {},
  reloadJoinRequests: async () => {},
  removeMemberFromOrganization: async () => {},
  deleteNoteFromOrganization: async () => {},
  fetchOrganizationMembers: async () => {},
  orgPinnedNotes: {},
  orgSelectedNotes: {},
  setOrgPinnedNotes: () => {},
  setOrgSelectedNotes: () => {},
  getCurrentOrganizationNotes: () => {},
  pinAllOrgSelectedNotes: async () => {},
  removeOrgNoteFromSelectedNotes: async () => {},
  removeOrgNoteFromPinnedNotes: async () => {},
  leaveOrganization: async () => {},
  deleteOrganization: async () => {},
});

const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  const [currentOrganization, setCurrentOrganization] = useState<Organization>();

  const [notes, setNotes] = useState<Note[]>([]);

  const [members, setMembers] = useState<User[]>([]);

  const [orgPinnedNotes, setOrgPinnedNotes] = useState<{ [orgId: string]: Note[] }>(() => {
    const storedOrgPinnedNotes = localStorage.getItem("orgPinnedNotes");
    return storedOrgPinnedNotes ? JSON.parse(storedOrgPinnedNotes) : {};
  });
  const [orgSelectedNotes, setOrgSelectedNotes] = useState<{ [orgId: string]: Note[] }>(() => {
    const storedOrgSelectedNotes = localStorage.getItem("orgSelectedNotes");
    return storedOrgSelectedNotes ? JSON.parse(storedOrgSelectedNotes) : {};
  });

  const pathName = usePathname();

  const fetchOrganizations = async () => {
    if (!user) return;
    try {
      const orgCollection = collection(db, "organizations");
      const orgQuery = query(
        orgCollection,
        where("members", "array-contains", user.id)
      );
      const orgSnapshot = await getDocs(orgQuery);
      const orgList = orgSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[];

      setOrganizations(orgList);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchJoinRequests = async () => {
    if (!user) return;

    try {
      const filteredOrgs = organizations.filter(
        (org) => org.author === user.id
      );

      const requestCollection = collection(db, "joinRequests");
      const requestQuery = query(
        requestCollection,
        where(
          "orgId",
          "in",
          filteredOrgs.map((org) => org.id)
        )
      );

      const requestSnapshot = await getDocs(requestQuery);

      const requestList = await Promise.all(
        requestSnapshot.docs.map(async (doc) => {
          const userData = await fetch(
            `/api/getUserByid/${doc.data().userId}`
          ).then((res) => res.json());

          return {
            id: doc.id,
            orgId: doc.data().orgId,
            status: doc.data().status,
            user: userData,
          } as JoinRequest;
        })
      );

      setJoinRequests(requestList);
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };

  const addOrganization = async (name: string, members?: string[]) => {
    if (!user) return;
    console.log(name, members);
    try {
      await addDoc(collection(db, "organizations"), {
        name,
        author: user.id,
        members: members ? [user.id, ...members] : [user.id],
        notes: [],
      });
      fetchOrganizations();
    } catch (error) {
      console.error("Error adding organization:", error);
    }
  };

  const requestJoinOrganization = async (orgId: string) => {
    if (!user) return;
    try {
      const org = await getDoc(doc(db, "organizations", orgId));
      if (!org.exists()) {
        console.log("Org not found");
        toast({
          variant: "destructive",
          title: "Organization not found",
        });
        return;
      }
      // console.log(org.data());
      if (org.data().members.includes(user.id)) {
        toast({
          variant: "destructive",
          title: "You are already a member of this organization",
        });
        return;
      }

      const requestRef = collection(db, "joinRequests");
      const requestQuery = query(
        requestRef,
        where("orgId", "==", orgId),
        where("userId", "==", user.id),
        where("status", "==", JoinRequestStatus.pending)
      );

      const requestSnapshot = await getDocs(requestQuery);
      if (requestSnapshot.empty) {
        await addDoc(requestRef, {
          orgId,
          userId: user.id,
          status: "pending",
        });
        toast({
          title: "Request to join organization sent",
        });
        fetchJoinRequests();
        return;
      } else {
        toast({
          variant: "destructive",
          title: "You already have a pending request to join this organization",
        });
        return;
      }
    } catch (error) {
      console.error("Error requesting to join organization:", error);
    }
  };

  const approveJoinRequest = async (requestId: string) => {
    if (!user) return;
    try {
      const requestRef = doc(db, "joinRequests", requestId);
      const requestSnapshot = await getDoc(requestRef);
      const requestData = requestSnapshot.data();

      const orgRef = doc(db, "organizations", requestData?.orgId);
      await updateDoc(orgRef, {
        members: arrayUnion(requestData?.userId),
      });

      await updateDoc(requestRef, {
        status: JoinRequestStatus.approved,
      });

      fetchOrganizations();
      fetchJoinRequests();
    } catch (error) {
      console.error("Error approving join request:", error);
    }
  };

  const rejectJoinRequest = async (requestId: string) => {
    if (!user) return;
    try {
      const requestRef = doc(db, "joinRequests", requestId);
      await updateDoc(requestRef, {
        status: JoinRequestStatus.rejected,
      });

      fetchJoinRequests();
    } catch (error) {
      console.error("Error rejecting join request:", error);
    }
  };

  const addNoteToOrganization = async (orgId: string, noteId: string) => {
    if (!user) return;
    try {
      const orgRef = doc(db, "organizations", orgId);
      await updateDoc(orgRef, {
        notes: arrayUnion(noteId),
      });
      setCurrentOrganization(organizations.find((org) => org.id === orgId));
      getCurrentOrganizationNotes(orgId);
    } catch (error) {
      console.error("Error adding note to organization:", error);
    }
  };

  const getCurrentOrganizationNotes = async (orgId: string) => {
    if (!user) return;
    if (!orgId) return;
    const notes = await fetchOrganizationNotes(orgId, user);
    setNotes(notes);
  };

  const updateCurrentOrganization = async () => {
    if (!user) return;
    if (pathName.includes("organisation")) {
      const orgId = pathName.split("/")[2];
      
      // console.log(pathName.split("/"));
      // console.log(orgId);
      
      if (!orgId || orgId === 'join' || orgId === 'joinRequests') return;

      const org = await getDoc(doc(db, "organizations", orgId));
      if (!org.exists()) {
        toast({
          variant: "destructive",
          title: "Organization not found",
        });
        return;
      }
      setCurrentOrganization({
        id: orgId,
        ...org.data(),
      } as Organization);
      getCurrentOrganizationNotes(orgId);
    }
  };

  const deleteNoteFromOrganization = async (orgId: string, noteId: string) => {
    if (!orgId) return;
    if (!noteId) return;
    try {
      const orgRef = doc(db, "organizations", orgId);
      await updateDoc(orgRef, {
        notes: arrayRemove(noteId),
      });
      setOrgSelectedNotes(prev => ({
        ...prev,
        [orgId]: prev[orgId]?.filter(note => note.id !== noteId) || []
      }));
      setOrgPinnedNotes(prev => ({
        ...prev,
        [orgId]: prev[orgId]?.filter(note => note.id !== noteId) || []
      }));

      getCurrentOrganizationNotes(orgId);
    } catch (error) {
      console.error("Error deleting note from organization: ", error);
    }
  };

  const removeMemberFromOrganization = async (
    orgId: string,
    userId: string
  ) => {
    if (!user) return;
    try {
      const orgRef = doc(db, "organizations", orgId);

      await updateDoc(orgRef, {
        members: arrayRemove(userId),
      });
      toast({
        title: "Member removed from organization",
      });
      fetchOrganizations();
      fetchOrganizationMembers(orgId);
    } catch (error) {
      console.error("Error removing member from organization:", error);
    }
  };

  const fetchOrganizationMembers = async (orgId: string) => {
    if (!user) return;
    try {
      const orgRef = doc(db, "organizations", orgId);
      const orgSnapshot = await getDoc(orgRef);
      if (!orgSnapshot.exists()) return;
      const members = await Promise.all(orgSnapshot.data().members.map(async (memberId : string) => {
        const userData = await fetch(
          `/api/getUserByid/${memberId}`
        ).then((res) => res.json());

        return {
          id: memberId,
          ...userData,
        } as User;
      })) as User[];

      setMembers(members);

    } catch (error) {
      console.error("Error fetching organization members:", error);
    }
  };


  const updateOrgPinnedNotes = (orgId: string, notes: Note[]) => {
    setOrgPinnedNotes(prev => ({
      ...prev,
      [orgId]: notes
    }));
  };

  const updateOrgSelectedNotes = (orgId: string, notes: Note[]) => {
    setOrgSelectedNotes(prev => ({
      ...prev,
      [orgId]: notes
    }));
  };

  const pinAllOrgSelectedNotes = async () => {
    if (!currentOrganization) return;
    const notesToPin = orgSelectedNotes[currentOrganization.id];

    setOrgPinnedNotes(prev => ({
      ...prev,
      [currentOrganization.id]: notesToPin
    }));

    setOrgSelectedNotes(prev => ({
      ...prev,
      [currentOrganization.id]: []
    }));
  };

  const removeOrgNoteFromSelectedNotes = async (noteId: string) => {
    if (!currentOrganization) return;
    const notes = orgSelectedNotes[currentOrganization.id];
    setOrgSelectedNotes(prev => ({
      ...prev,
      [currentOrganization.id]: notes.filter(note => note.id !== noteId)
    }));
  };

  const removeOrgNoteFromPinnedNotes = async (noteId: string) => {
    if (!currentOrganization) return;
    const notes = orgPinnedNotes[currentOrganization.id];
    setOrgPinnedNotes(prev => ({
      ...prev,
      [currentOrganization.id]: notes.filter(note => note.id !== noteId)
    }));
  };

  const leaveOrganization = async (orgId: string) => {
    if (!user) return;
    try {
      const orgRef = doc(db, "organizations", orgId);
      const orgDoc = await getDoc(orgRef);
      
      if (!orgDoc.exists()) {
        toast({
          variant: "destructive",
          title: "Organization not found",
        });
        return;
      }
  
      const orgData = orgDoc.data() as Organization;
  
      if (orgData.author === user.id) {
        toast({
          variant: "destructive",
          title: "You can't leave an organization you created",
          description: "Transfer ownership or delete the organization instead",
        });
        return;
      }
  
      await updateDoc(orgRef, {
        members: arrayRemove(user.id),
      });
  
      // Clear local storage for this org
      setOrgPinnedNotes(prev => {
        const { [orgId]: _, ...rest } = prev;
        return rest;
      });
      setOrgSelectedNotes(prev => {
        const { [orgId]: _, ...rest } = prev;
        return rest;
      });
  
      toast({
        title: "You have left the organization",
      });
  
      // Trigger a reload of organizations
      fetchOrganizations();
  
    } catch (error) {
      console.error("Error leaving organization:", error);
      toast({
        variant: "destructive",
        title: "Failed to leave organization",
        description: "Please try again later",
      });
    }
  };

  //TODO: Review this code

  const deleteNoteImage = async (id: string, imageUrltoDelete: string) => {
    if (!id) return;
    const noteRef = doc(db, "notes", id);
    const imageRef = ref(storage, imageUrltoDelete);
    try {
      await deleteObject(imageRef);
      await updateDoc(noteRef, {
        imageUrl: arrayRemove(imageUrltoDelete),
      });
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

    } catch (error) {
      console.error("Error deleting document and images: ", error);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    if (!user) return;
    try {
      const orgRef = doc(db, "organizations", orgId);
      const orgDoc = await getDoc(orgRef);  

      await Promise.all(orgDoc.data()?.notes.map(async (noteId : string) => {
        await deleteNote(noteId);
      }));

      await deleteDoc(orgRef);
      toast({
        title: "Organization deleted",
      });
      await fetchOrganizations();
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete organization",
        description: "Please try again later",
      });
    }
  };

  useEffect(() => {
    localStorage.setItem("orgPinnedNotes", JSON.stringify(orgPinnedNotes));
  }, [orgPinnedNotes]);

  useEffect(() => {
    localStorage.setItem("orgSelectedNotes", JSON.stringify(orgSelectedNotes));
  }, [orgSelectedNotes]);

  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  useEffect(() => {
    if (organizations.length) {
      fetchJoinRequests();
    }
  }, [organizations]);

  useEffect(() => {
    updateCurrentOrganization();
  }, [pathName, organizations]);

  useEffect(() => {
    if (currentOrganization) {
      fetchOrganizationMembers(currentOrganization.id);
    }
  }, [currentOrganization]);

  return (
    <OrganizationContext.Provider
      value={{
        members,
        orgNotes: notes,
        currentOrganization,
        organizations,
        joinRequests,
        addOrganization,
        requestJoinOrganization,
        approveJoinRequest,
        rejectJoinRequest,
        addNoteToOrganization,
        reloadOrganizations: fetchOrganizations,
        reloadJoinRequests: fetchJoinRequests,
        removeMemberFromOrganization,
        deleteNoteFromOrganization,
        fetchOrganizationMembers,
        orgPinnedNotes,
        orgSelectedNotes,
        setOrgPinnedNotes: updateOrgPinnedNotes,
        setOrgSelectedNotes: updateOrgSelectedNotes,
        getCurrentOrganizationNotes,
        pinAllOrgSelectedNotes,
        removeOrgNoteFromSelectedNotes,
        removeOrgNoteFromPinnedNotes,
        leaveOrganization,
        deleteOrganization
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationProvider;
export { OrganizationContext };
