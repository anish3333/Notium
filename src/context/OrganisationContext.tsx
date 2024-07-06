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
  DocumentData,
  deleteDoc,
} from "firebase/firestore";

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
  organizations: Organization[];
  joinRequests: JoinRequest[];
  addOrganization: (name: string) => Promise<void>;
  requestJoinOrganization: (orgId: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  addNoteToOrganization: (orgId: string, noteId: string) => Promise<void>;
  reloadOrganizations: () => Promise<void>;
  reloadJoinRequests: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue>({
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

  const addOrganization = async (name: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "organizations"), {
        name,
        author: user.id,
        members: [user.id],
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
      fetchOrganizations();
    } catch (error) {
      console.error("Error adding note to organization:", error);
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

  return (
    <OrganizationContext.Provider
      value={{
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
