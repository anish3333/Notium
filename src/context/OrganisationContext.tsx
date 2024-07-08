"use client";
import { useUser } from "@clerk/nextjs";
import { createContext, useEffect, useState, ReactNode } from "react";
import { db } from "@/firebase/firebaseConfig";
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
} from "firebase/firestore";
import { usePathname } from "next/navigation";
import { fetchOrganizationNotes } from "@/lib/orgUtils";
import { Note } from "@/types";

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
  userId: string;
  status: string;
}

interface OrganizationContextValue {
  orgNotes: Note[];
  currentOrganization: Organization | undefined;
  organizations: Organization[];
  joinRequests: JoinRequest[];
  addOrganization: (name: string, members: string[]) => Promise<void>;
  requestJoinOrganization: (orgId: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  addNoteToOrganization: (orgId: string, noteId: string) => Promise<void>;
  reloadOrganizations: () => Promise<void>;
  reloadJoinRequests: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue>({
  orgNotes: [],
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
});

const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization>();
  const [notes, setNotes] = useState<Note[]>([]);
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
      const requestList = requestSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JoinRequest[];

      setJoinRequests(requestList);
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };

  const addOrganization = async (name: string, members: string[]) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "organizations"), {
        name,
        author: user.id,
        members: [user.id, ...members],
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
      await addDoc(collection(db, "joinRequests"), {
        orgId,
        userId: user.id,
        status: "pending",
      });
      fetchJoinRequests();
    } catch (error) {
      console.error("Error requesting to join organization:", error);
    }
  };

  const approveJoinRequest = async (requestId: string) => {
    if (!user) return;
    try {
      const requestRef = doc(db, "joinRequests", requestId);
      const requestSnapshot = await getDoc(requestRef);
      const requestData = requestSnapshot.data() as JoinRequest;

      const orgRef = doc(db, "organizations", requestData.orgId);
      await updateDoc(orgRef, {
        members: arrayUnion(requestData.userId),
      });

      await updateDoc(requestRef, {
        status: "approved",
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
        status: "rejected",
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

  const updateCurrentOrganization = () => {
    if (!user) return;
    if (pathName.includes("organisation")) {
      const orgId = pathName.split("/")[2];
      setCurrentOrganization(organizations.find((org) => org.id === orgId));
      getCurrentOrganizationNotes(orgId);
    }
  };

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

  return (
    <OrganizationContext.Provider
      value={{
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
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationProvider;
export { OrganizationContext };
