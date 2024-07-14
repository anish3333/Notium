"use client";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { UserDB } from "@/types";

interface CollaboratorsListProps {
  open: boolean;
  handleClose: () => void;
  collaborators: string[] | undefined;
  removeCollaborator: (userId: string) => void;
}


const CollaboratorsList = ({
  open,
  handleClose,
  collaborators,
  removeCollaborator,
}: CollaboratorsListProps) => {
  const [collaboratorsData, setCollaboratorsData] = useState<
    UserDB[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const { user } = useUser();

  useEffect(() => {
    if (!user || !collaborators) {
      handleClose();
      return;
    }

    const getCollaborators = async () => {
      setLoading(true); // Start loading
      if (!user || !collaborators) return;
      try {
        const users = await Promise.all(
          collaborators.map(
            async (collaborator) => {
              const userDocRef = doc(db, "users", collaborator);
              const userDocSnapshot = await getDoc(userDocRef);
              if (userDocSnapshot.exists()) {
                const userData = userDocSnapshot.data();
                return {
                  id: userData.id,
                  ...userData,
                } as UserDB;
              } 
            }
          ) 
        ) as UserDB[];
        setCollaboratorsData(users);
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    getCollaborators();
  }, [user, collaborators]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        asChild
        className="fixed max-w-md p-6"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
          {
            // Render collaborators only when not loading
            collaboratorsData && collaboratorsData.length > 0 ? (
              collaboratorsData.map((collaborator, index) => (
                <div
                  className="flex items-center gap-2 justify-between"
                  key={index}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <img
                      src={collaborator.avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <p>{collaborator.name}</p>
                  </div>
                  <div>
                    <Button
                      onClick={() => {
                        removeCollaborator(collaborator.id);
                        toast({
                          variant: "destructive",
                          title: "Collaborator removed",
                          description: `You have removed ${collaborator.name} from the collaboration`,
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            ) : loading ? (
              <p>Loading...</p>
            ) : (
              <p>No collaborators</p>
            )
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorsList;
