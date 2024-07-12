'use client';
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import React from 'react'

import { useEffect } from "react";
import { db } from "@/firebase/firebaseConfig";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useUser } from '@clerk/nextjs';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
      <SyncUserWithFirebase>
      <div className="flex w-full overflow-x-hidden">
        <div className='max-sm:hidden'>
          <Sidebar />
        </div>
        <div className="flex-1 sm:pl-[4rem]">
          <Navbar />
          <main className='w-full'>{children}</main>
        </div>
      </div>
      </SyncUserWithFirebase>
  )
}
export default layout

const SyncUserWithFirebase = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  useEffect(() => {
    const createUserInFirestore = async (user: any) => {
      const userCollectionRef = collection(db, "users");
      const userQuery = query(userCollectionRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(userQuery);


      // console.log(querySnapshot);

      if (querySnapshot.empty) {
        await addDoc(userCollectionRef, {
          userId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          name: user.fullName,
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
