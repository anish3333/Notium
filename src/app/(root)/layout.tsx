"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import React from "react";

import { useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { requestNotificationPermission } from "@/lib/notificationUtils";
import { checkReminders } from "@/lib/reminderUtils";

const layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  useEffect(() => {
    // console.log("checking reminders");
    requestNotificationPermission();
    const intervalId = setInterval(() => {
      if (user?.id) checkReminders(user.id);
    }, 15000);
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <>
      <SyncUserWithFirebase>
        <div className="flex min-h-screen">
          <div className="hidden md:flex">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col">
            <main className="flex-1 md:ml-64">
              <div className="flex flex-1 sticky top-0">
                <Navbar />
              </div>
              <div className="p-1 md:rounded-tl-xl bg-gray-800">
                <div>{children}</div>
              </div>
            </main>
          </div>
        </div>
      </SyncUserWithFirebase>
    </>
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
