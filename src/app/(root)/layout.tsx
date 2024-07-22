"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import React from "react";

import { useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SyncUserWithFirebase>
      <div className="flex min-h-screen ">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 md:ml-64">
            <div className="flex flex-1 sticky top-0">
              <Navbar />
            </div>
            {children}
          </main>
        </div>
      </div>
    </SyncUserWithFirebase>
  );
};
export default layout;

const SyncUserWithFirebase = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  // console.log(user);

  useEffect(() => {
    const createUserInFirestore = async (user: any) => {
      const userCollectionRef = collection(db, "users");
      const userQuery = query(
        userCollectionRef,
        where("userId", "==", user.id)
      );
      const querySnapshot = await getDocs(userQuery);

      // console.log(querySnapshot);

      if (querySnapshot.empty) {
        await addDoc(userCollectionRef, {
          userId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          name: user.fullName,
          avatar: user.hasImage ? user.imageUrl : null,
          createdAt: new Date(),
        });
      }
    };

    if (user) {
      createUserInFirestore(user);
    }
  }, [user]);

  return <>{children}</>;
};
